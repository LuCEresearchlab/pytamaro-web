import { debounce } from 'lodash';
import { WRITE_DEBOUNCE_MS } from './codeCellsPersistence';
import { sameBytes } from './ideFileContent';
import { IdeFile, isIdeFile } from './ideFiles';

const DATABASE_NAME = 'pytamaro-web-ide';
const DATABASE_VERSION = 1;
const FILES_STORE = 'files';
const CHANNEL_NAME = 'pytamaro-web-ide-files';

// Prefixed so that a folder record can never collide with a file path.
const FOLDER_PREFIX = '\u0000dir:';

type FolderRecord = { path: string; folder: true };

type StoredRecord = IdeFile | FolderRecord;

export type StoredWorkspace = { files: IdeFile[]; folders: string[] };

function isFolderRecord(record: unknown): record is FolderRecord {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as { folder?: unknown }).folder === true &&
    typeof (record as { path?: unknown }).path === 'string'
  );
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: 'path' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readAll(store: IDBObjectStore): Promise<StoredRecord[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as StoredRecord[]);
    request.onerror = () => reject(request.error);
  });
}

function broadcastChange(): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'changed' });
  channel.close();
}

export async function clearStoredIdeWorkspace(): Promise<void> {
  try {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(FILES_STORE, 'readwrite');
        transaction.objectStore(FILES_STORE).clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      db.close();
    }
    broadcastChange();
  } catch {
    // IndexedDB may be unavailable (e.g., in some private-browsing modes).
  }
}

/**
 * Persists the files of the IDE workspace in IndexedDB.
 *
 * IndexedDB (unlike local storage) stores raw bytes natively and is not limited
 * to the small local-storage quota. Only files whose content changed since the
 * last write are updated. Other tabs are notified through a `BroadcastChannel`.
 */
export class IdeFilesPersistence {
  private databasePromise: Promise<IDBDatabase> | null = null;
  private lastSaved = new Map<string, IdeFile>();
  private lastSavedFolders = new Set<string>();
  private pending: StoredWorkspace | null = null;
  private writeChain: Promise<void> = Promise.resolve();
  private channel: BroadcastChannel | null = null;
  private readonly debouncedWrite = debounce(() => {
    void this.flush();
  }, WRITE_DEBOUNCE_MS);

  private database(): Promise<IDBDatabase> {
    if (this.databasePromise === null) {
      this.databasePromise = openDatabase().catch((error: unknown) => {
        // A failed open would otherwise break every subsequent save.
        this.databasePromise = null;
        throw error;
      });
    }
    return this.databasePromise;
  }

  /**
   * Loads the stored files. Returns null when nothing is stored.
   */
  async load(): Promise<StoredWorkspace | null> {
    try {
      const db = await this.database();
      const transaction = db.transaction(FILES_STORE, 'readonly');
      const records = await readAll(transaction.objectStore(FILES_STORE));
      const files = records.filter(isIdeFile);
      const folders = records
        .filter(isFolderRecord)
        .map((record) => record.path.slice(FOLDER_PREFIX.length));
      this.lastSaved = new Map(files.map((file) => [file.path, file]));
      this.lastSavedFolders = new Set(folders);
      return files.length > 0 || folders.length > 0 ? { files, folders } : null;
    } catch {
      // IndexedDB may be unavailable (e.g., in some private-browsing modes).
      return null;
    }
  }

  /** Schedules a write of the whole workspace snapshot. */
  save(files: readonly IdeFile[], folders: readonly string[]): void {
    this.pending = { files: [...files], folders: [...folders] };
    this.debouncedWrite();
  }

  /** Writes any pending snapshot immediately. */
  flush(): Promise<void> {
    this.debouncedWrite.cancel();
    const pending = this.pending;
    this.pending = null;
    if (pending !== null) {
      this.writeChain = this.writeChain.then(() => this.writeNow(pending));
    }
    return this.writeChain;
  }

  /**
   * Calls `onChange` when another tab has written files. The caller is
   * expected to reload through {@link load}.
   */
  watch(onChange: () => void): () => void {
    if (typeof BroadcastChannel === 'undefined') {
      return () => {};
    }
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const listener = (event: MessageEvent) => {
      if ((event.data as { type?: unknown } | null)?.type === 'changed') {
        onChange();
      }
    };
    channel.addEventListener('message', listener);
    this.channel = channel;
    return () => {
      channel.removeEventListener('message', listener);
      channel.close();
      if (this.channel === channel) {
        this.channel = null;
      }
    };
  }

  private async writeNow({ files, folders }: StoredWorkspace): Promise<void> {
    const next = new Map(files.map((file) => [file.path, file]));
    const changed: IdeFile[] = [];
    next.forEach((file, path) => {
      const previous = this.lastSaved.get(path);
      if (
        previous === undefined ||
        !sameBytes(previous.content, file.content)
      ) {
        changed.push(file);
      }
    });
    const deleted = Array.from(this.lastSaved.keys()).filter(
      (path) => !next.has(path),
    );
    const nextFolders = new Set(folders);
    const addedFolders = folders.filter(
      (path) => !this.lastSavedFolders.has(path),
    );
    const removedFolders = Array.from(this.lastSavedFolders).filter(
      (path) => !nextFolders.has(path),
    );
    if (
      changed.length === 0 &&
      deleted.length === 0 &&
      addedFolders.length === 0 &&
      removedFolders.length === 0
    ) {
      return;
    }

    try {
      const db = await this.database();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(FILES_STORE, 'readwrite');
        const store = transaction.objectStore(FILES_STORE);
        changed.forEach((file) => store.put(file));
        deleted.forEach((path) => store.delete(path));
        addedFolders.forEach((path) =>
          store.put({
            path: `${FOLDER_PREFIX}${path}`,
            folder: true,
          } satisfies FolderRecord),
        );
        removedFolders.forEach((path) =>
          store.delete(`${FOLDER_PREFIX}${path}`),
        );
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      this.lastSaved = next;
      this.lastSavedFolders = nextFolders;
      this.channel?.postMessage({ type: 'changed' });
    } catch {
      // Keep the in-memory workspace usable even if persistence fails.
      // Ideally we would warn the user.
    }
  }
}
