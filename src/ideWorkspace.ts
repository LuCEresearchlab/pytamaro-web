import type { EditorContext } from './editor/editorContext';
import type { EditorSession } from './editorSession';
import {
  decodeText,
  encodeText,
  MAX_EDITOR_BYTES,
  sameBytes,
} from './ideFileContent';
import { isPythonFileName, type IdeFile } from './ideFiles';

/**
 * A file's stored bytes and the lazily computed text view.
 *
 * `text === undefined` means "not decoded yet", `null` means "not decodable as
 * text". The cache is dropped on every write.
 */
type Entry = {
  bytes: Uint8Array;
  text?: string | null;
};

/**
 * Owns all files of the IDE workspace as bytes.
 *
 * The editor session is kept in sync for the Python analyzer and for open
 * Monaco models, but it is not the source of truth: the bytes stored here are.
 * Whether a file is text is derived from those bytes when it is read.
 */
export class IdeWorkspace {
  readonly editorSession: EditorSession;

  private readonly entries = new Map<string, Entry>();
  // Explicitly keep track of folders, which may contain no files.
  private explicitFolders = new Set<string>();
  private readonly listeners = new Set<() => void>();
  private readonly editorContexts = new Map<string, EditorContext>();

  constructor(editorSession: EditorSession) {
    this.editorSession = editorSession;
    editorSession.subscribe(() => this.notify());
  }

  /* ==== Paths ==== */

  files(): string[] {
    return Array.from(this.entries.keys());
  }

  hasFile(path: string): boolean {
    return this.entries.has(path);
  }

  folders(): string[] {
    return Array.from(this.explicitFolders);
  }

  addFolder(path: string) {
    if (!this.explicitFolders.has(path)) {
      this.explicitFolders.add(path);
      this.notify();
    }
  }

  removeFolder(path: string) {
    if (this.explicitFolders.delete(path)) {
      this.notify();
    }
  }

  setFolders(paths: readonly string[]) {
    const next = new Set(paths);
    if (
      next.size !== this.explicitFolders.size ||
      paths.some((path) => !this.explicitFolders.has(path))
    ) {
      this.explicitFolders = next;
      this.notify();
    }
  }

  bytes(path: string): Uint8Array | undefined {
    return this.entries.get(path)?.bytes;
  }

  text(path: string): string | undefined {
    const entry = this.entries.get(path);
    if (entry === undefined) {
      return undefined;
    }
    if (entry.text === undefined) {
      entry.text = decodeText(entry.bytes) ?? null;
    }
    return entry.text ?? undefined;
  }

  /** Replaces a file's bytes. The text view is re-derived lazily. */
  setBytes(path: string, bytes: Uint8Array): void {
    const existing = this.entries.get(path);
    if (existing !== undefined && sameBytes(existing.bytes, bytes)) {
      return;
    }
    this.entries.set(path, { bytes });
    this.syncEditorSession(path);
    this.notify();
  }

  /**
   * Stores a user edit as text. This is the only writer for editor content;
   * programmatic and workspace-driven updates must use {@link setBytes}.
   */
  setText(path: string, text: string): void {
    const bytes = encodeText(text);
    const existing = this.entries.get(path);
    if (existing !== undefined && sameBytes(existing.bytes, bytes)) {
      existing.text = text;
      return;
    }
    this.entries.set(path, { bytes, text });
    if (this.editorSession.hasFile(path)) {
      this.editorSession.setFileContent(path, text);
    } else {
      this.editorSession.addFiles([{ name: path, content: text }]);
    }
    this.notify();
  }

  addFiles(files: readonly IdeFile[]): boolean {
    let changed = false;
    files.forEach((file) => {
      const existing = this.entries.get(file.path);
      if (existing === undefined || !sameBytes(existing.bytes, file.content)) {
        changed = true;
      }
      this.setBytes(file.path, file.content);
    });
    return changed;
  }

  /** Removes a file. Returns whether it existed. */
  removeFile(path: string): boolean {
    const existing = this.entries.get(path);
    if (existing === undefined) {
      return false;
    }
    this.entries.delete(path);
    this.editorContexts.delete(path);
    if (this.editorSession.hasFile(path)) {
      this.editorSession.closeDocument(path);
    }
    this.notify();
    return true;
  }

  /** Renames (or moves) a file. Returns whether it changed. */
  renameFile(oldPath: string, newPath: string): boolean {
    const entry = this.entries.get(oldPath);
    if (oldPath === newPath || entry === undefined) {
      return false;
    }
    this.entries.delete(oldPath);
    this.entries.set(newPath, entry);
    this.editorContexts.delete(oldPath);
    if (this.editorSession.hasFile(oldPath)) {
      this.editorSession.closeDocument(oldPath);
    }
    this.syncEditorSession(newPath);
    this.notify();
    return true;
  }

  /** A snapshot of the whole workspace, suitable for persistence. */
  snapshot(): IdeFile[] {
    return Array.from(this.entries, ([path, { bytes }]) => ({
      path,
      content: bytes,
    }));
  }

  /**
   * The adapter that binds a Monaco model and user edits to this workspace.
   *
   * User edits go through {@link setText}; model creation and workspace-driven
   * updates never write text back.
   */
  editorContext(path: string): EditorContext {
    let context = this.editorContexts.get(path);
    if (context === undefined) {
      const base = this.editorSession.editorContext(path);
      context = {
        ...base,
        initialSource: () => this.text(path) ?? '',
        currentSource: () => this.text(path) ?? '',
        attachModel: (model) =>
          this.editorSession.attachModel(
            model,
            { file: path, previousLines: 0 },
            (text) => this.setText(path, text),
          ),
        updateSource: (text) => this.setText(path, text),
      };
      this.editorContexts.set(path, context);
    }
    return context;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Mirrors the current text (if any) into the analyzer and open models. */
  private syncEditorSession(path: string): void {
    const bytes = this.entries.get(path)?.bytes;
    const mirror =
      bytes !== undefined &&
      (isPythonFileName(path) || bytes.length <= MAX_EDITOR_BYTES);
    const text = mirror ? this.text(path) : undefined;
    if (text === undefined) {
      if (this.editorSession.hasFile(path)) {
        this.editorSession.closeDocument(path);
      }
      return;
    }
    if (this.editorSession.hasFile(path)) {
      this.editorSession.setFileContent(path, text);
    } else {
      this.editorSession.addFiles([{ name: path, content: text }]);
    }
  }

  private notify() {
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}
