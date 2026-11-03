import { EditorSession } from './editorSession';
import { contentBytes, IdeFile, isTextContent, sameContent } from './ideFiles';

/**
 * Owns all files of the IDE workspace.
 *
 * Text files live in an {@link EditorSession}, so that Monaco and the Python
 * analyzer work on them exactly as they do for activities. Binary files are
 * kept here, as raw bytes. Both kinds share one namespace of relative paths.
 */
export class IdeWorkspace {
  readonly editorSession: EditorSession;

  private readonly binaryFiles = new Map<string, Uint8Array>();
  // Explicitly keep track of folders, which may contain no files.
  private explicitFolders = new Set<string>();
  private readonly listeners = new Set<() => void>();

  constructor(editorSession: EditorSession) {
    this.editorSession = editorSession;
    editorSession.subscribe(() => this.notify());
  }

  /* ==== Paths ==== */

  files(): string[] {
    return [
      ...this.editorSession.files(),
      ...Array.from(this.binaryFiles.keys()),
    ];
  }

  hasFile(path: string): boolean {
    return this.binaryFiles.has(path) || this.editorSession.hasFile(path);
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

  isBinary(path: string): boolean {
    return this.binaryFiles.has(path);
  }

  text(path: string): string | undefined {
    return this.binaryFiles.has(path)
      ? undefined
      : this.editorSession.text(path);
  }

  content(path: string): string | Uint8Array | undefined {
    return this.binaryFiles.get(path) ?? this.editorSession.text(path);
  }

  bytes(path: string): Uint8Array | undefined {
    const content = this.content(path);
    return content === undefined ? undefined : contentBytes(content);
  }

  addFiles(files: readonly IdeFile[]): boolean {
    let changed = false;
    files.forEach((file) => {
      if (this.setFile(file)) {
        changed = true;
      }
    });
    return changed;
  }

  /** Sets a file. Returns whether anything changed. */
  setFile(file: IdeFile): boolean {
    const { path, content } = file;
    if (isTextContent(content)) {
      const wasBinary = this.binaryFiles.delete(path);
      if (!this.editorSession.hasFile(path)) {
        this.editorSession.addFiles([{ name: path, content }]);
        return true;
      }
      if (!wasBinary && this.editorSession.text(path) === content) {
        return false;
      }
      this.editorSession.setFileContent(path, content);
      return true;
    }

    if (this.editorSession.hasFile(path)) {
      this.editorSession.closeDocument(path);
    }
    const existing = this.binaryFiles.get(path);
    if (existing !== undefined && sameContent(existing, content)) {
      return false;
    }
    this.binaryFiles.set(path, content);
    this.notify();
    return true;
  }

  /** Removes a file. Returns whether it existed. */
  removeFile(path: string): boolean {
    if (this.binaryFiles.delete(path)) {
      this.notify();
      return true;
    }
    if (!this.editorSession.hasFile(path)) {
      return false;
    }
    this.editorSession.closeDocument(path);
    return true;
  }

  /** Renames (or moves) a file. Returns whether it changed. */
  renameFile(oldPath: string, newPath: string): boolean {
    if (oldPath === newPath || !this.hasFile(oldPath)) {
      return false;
    }
    const binary = this.binaryFiles.get(oldPath);
    if (binary !== undefined) {
      this.binaryFiles.delete(oldPath);
      this.binaryFiles.set(newPath, binary);
      this.notify();
      return true;
    }
    const text = this.editorSession.text(oldPath);
    if (text === undefined) {
      return false;
    }
    this.editorSession.addFiles([{ name: newPath, content: text }]);
    this.editorSession.closeDocument(oldPath);
    return true;
  }

  /** A snapshot of the whole workspace, suitable for persistence. */
  snapshot(): IdeFile[] {
    return [
      ...this.editorSession.files().map((path) => ({
        path,
        content: this.editorSession.text(path) ?? '',
      })),
      ...Array.from(this.binaryFiles, ([path, content]) => ({
        path,
        content,
      })),
    ];
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify() {
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}
