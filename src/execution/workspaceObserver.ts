import type { PyodideAPI } from 'pyodide';
import type { WorkspaceEvent } from './workspaceReporter';
import {
  MAX_EAGER_BYTES,
  WRITE_FLUSH_WINDOW_MS,
} from './workspaceSyncConstants';

/*
 * Live visibility of workspace files while a Python program runs.
 *
 * The Python worker runs synchronously: while the program executes it cannot
 * receive messages and its timers never fire. Files can therefore be reported
 * only from hooks that run inside filesystem operations (or from the FFI calls
 * the worker already blocks on, which `executorWorker` handles separately).
 *
 * Visibility semantics:
 * - A file's content becomes visible once it reaches the filesystem. Data still
 *   in Python's own `io` buffer is invisible to every design; `flush()` or
 *   `close()` make it visible.
 * - Creating a file (`open(path, "w")`) creates the node immediately, so it is
 *   reported immediately, before any content is written.
 * - Writes are coalesced: the `write` hook only marks the node dirty and content
 *   is copied at most once per `WRITE_FLUSH_WINDOW_MS`.
 * - Files larger than `MAX_EAGER_BYTES` are not copied by hooks. They appear at
 *   the next `input()`, a throttled FFI-point scan, or the end of the run.
 * - Mid-run scans are incremental and trust a file's size and mtime. An
 *   `mmap`-aliased write (no timestamp change) or a write followed by a
 *   backdating `utime` is caught only by the final reconciliation.
 * - Empty directories are reported as a complete set whenever entries change,
 *   so a folder created, filled, emptied, or deleted by the run is mirrored.
 * - Hooks can be incomplete. A missed event never means lost data: the final
 *   reconciliation compares the whole filesystem with the run's baseline.
 *
 * Emscripten internals relied on (pinned Pyodide version: see
 * `PYODIDE_VERSION` in `versions.ts`):
 * - `FS.filesystems.MEMFS.ops_table` holds the node/stream operation objects.
 *   Every MEMFS node points at those same objects, so the hooks are installed by
 *   mutating them in place. Replacing the table would not affect existing nodes.
 * - `ops_table.file.stream` has no `close`; adding one is the close hook.
 *   `FS.close` invokes `stream.stream_ops.close` when present.
 * - `FS.rename` temporarily removes the node from the name hash, so hooks must
 *   never use path-based APIs (`FS.readFile`, `FS.stat`, `FS.lookupPath`, ...).
 *   They use node fields and `FS.getPath(node)` only, after the original
 *   operation has restored the node to the tree.
 *
 * The self-test in `install` disables the hooks (`supported === false`) if the
 * close hook is not invoked, which degrades gracefully to scans at `input()`
 * and at the end of the run.
 */

type FSType = PyodideAPI['FS'];

type MemfsFileContents = Uint8Array | Int8Array;
type MemfsContents = MemfsFileContents | Record<string, MemfsNode>;

type MemfsNode = {
  name?: string;
  contents?: MemfsContents | null;
  usedBytes?: number;
  mode: number;
  parent?: MemfsNode | null;
};

type MemfsStream = {
  node: MemfsNode;
  flags: number;
};

type MemfsNodeOps = {
  mknod(parent: MemfsNode, name: string, mode: number, dev: unknown): MemfsNode;
  rename(oldNode: MemfsNode, newDir: MemfsNode, newName: string): void;
  unlink(parent: MemfsNode, name: string): void;
  rmdir(parent: MemfsNode, name: string): void;
};

type MemfsFileNodeOps = {
  setattr(node: MemfsNode, attr: { size?: number }): void;
};

type MemfsStreamOps = {
  write(
    stream: MemfsStream,
    buffer: Uint8Array,
    offset: number,
    length: number,
    position: number | undefined,
    canOwn?: boolean,
  ): number;
  close?: (stream: MemfsStream) => void;
};

type MemfsOpsTable = {
  dir: { node: MemfsNodeOps };
  file: { node: MemfsFileNodeOps; stream: MemfsStreamOps };
};

type WorkspaceEventSink = (events: WorkspaceEvent[]) => void;

const WRITE_FLAGS_MASK = 3; // O_WRONLY | O_RDWR

export class WorkspaceObserver {
  private readonly fs: FSType;
  private readonly root: string;

  private installed = false;
  private supportChecked = false;
  private isSupported = false;

  private sink: WorkspaceEventSink | null = null;
  private readonly dirty = new Set<MemfsNode>();
  private lastFlush = 0;

  /**
   * The root node is cached when observing starts, so that the empty-folder
   * set can be computed from node fields without path lookups inside hooks.
   */
  private rootNode: MemfsNode | null = null;
  private foldersDirty = false;
  private lastFolderFlush = 0;

  /** Set while the self-test writes its probe file. */
  private probePath: string | null = null;
  private probeSeen = false;

  constructor(fs: FSType, root: string) {
    this.fs = fs;
    this.root = root;
  }

  /** Whether the filesystem hooks are available in this environment. */
  get supported(): boolean {
    return this.isSupported;
  }

  /**
   * Installs the hooks (once) and starts reporting to `sink`.
   *
   * If the hooks are unavailable this is a no-op: `executorWorker` falls back
   * to scanning at `input()` and at the end of the run.
   */
  start(sink: WorkspaceEventSink): void {
    this.install();
    if (!this.isSupported) {
      return;
    }
    this.dirty.clear();
    this.lastFlush = 0;
    this.foldersDirty = false;
    this.lastFolderFlush = 0;
    this.rootNode = this.rootNodeOf();
    this.sink = sink;
  }

  /** Stops reporting and releases node references. */
  stop(): void {
    this.sink = null;
    this.dirty.clear();
    this.foldersDirty = false;
    this.rootNode = null;
    this.probePath = null;
  }

  /**
   * Reports the current content of every node written since the last flush.
   *
   * Called by `executorWorker` before blocking in an FFI call, and by the
   * throttled `write` hook.
   */
  flushDirty(): void {
    const sink = this.sink;
    if (sink === null || this.dirty.size === 0) {
      return;
    }
    this.lastFlush = Date.now();
    const nodes = Array.from(this.dirty);
    this.dirty.clear();

    const events: WorkspaceEvent[] = [];
    nodes.forEach((node) => {
      const name = this.reportableName(node);
      if (name === null) {
        return;
      }
      const content = this.content(node);
      if (content !== null) {
        events.push({ kind: 'put', name, content });
      }
    });
    this.emit(events);
  }

  /**
   * Reports the complete set of empty directories, if it changed.
   *
   * Walks node contents (never paths), so it is safe both inside hooks and at
   * the FFI points where the worker is otherwise blocked.
   */
  flushFolders(): void {
    if (this.sink === null || !this.foldersDirty) {
      return;
    }
    const folders = this.emptyFolders();
    if (folders === null) {
      // Keep the state dirty: a later attempt may succeed.
      return;
    }
    this.foldersDirty = false;
    this.lastFolderFlush = Date.now();
    this.emit([{ kind: 'folders', folders }]);
  }

  private install(): void {
    if (this.installed) {
      return;
    }
    this.installed = true;

    try {
      const table = this.opsTable();
      if (table === null) {
        throw new Error('MEMFS.ops_table is not available');
      }

      this.installDirNodeHooks(table.dir.node);
      this.installFileNodeHooks(table.file.node);
      this.installFileStreamHooks(table.file.stream);
      this.selfTest();
    } catch {
      this.isSupported = false;
      this.supportChecked = true;
      // eslint-disable-next-line no-console
      console.warn(
        'Workspace filesystem hooks are unavailable; files will appear at input() and at the end of the run.',
      );
    }
  }

  private opsTable(): MemfsOpsTable | null {
    const filesystems = (
      this.fs as unknown as {
        filesystems?: { MEMFS?: { ops_table?: MemfsOpsTable } };
      }
    ).filesystems;
    return filesystems?.MEMFS?.ops_table ?? null;
  }

  private installDirNodeHooks(ops: MemfsNodeOps): void {
    // Aliased so that the assignments are not to a parameter's property.
    const dirNode = ops;
    const originalMknod = ops.mknod;
    dirNode.mknod = (parent, name, mode, dev) => {
      // Always call the original first: it creates and links the node.
      const node = originalMknod.call(ops, parent, name, mode, dev);
      this.onMknod(node);
      this.markFolderChange();
      return node;
    };

    const originalUnlink = ops.unlink;
    dirNode.unlink = (parent, name) => {
      // The node is about to be detached: capture it (through node fields, not
      // a path lookup) so that a pending dirty write cannot resurrect it later.
      const node = this.childNode(parent, name);
      originalUnlink.call(ops, parent, name);
      if (node !== null) {
        this.dirty.delete(node);
      }
      this.onUnlink(parent, name);
      this.markFolderChange();
    };

    const originalRmdir = ops.rmdir;
    dirNode.rmdir = (parent, name) => {
      originalRmdir.call(ops, parent, name);
      this.markFolderChange();
    };

    const originalRename = ops.rename;
    dirNode.rename = (oldNode, newDir, newName) => {
      // Paths must be captured before the rename: during it the node is not
      // reachable through the name hash. Only nodes that will end up in (or
      // leave) the root are worth collecting.
      const moved = this.collectRenamedNodes(oldNode, newDir, newName);
      originalRename.call(ops, oldNode, newDir, newName);
      if (moved !== undefined) {
        this.onRenamed(moved);
      }
      this.markFolderChange();
    };
  }

  private installFileNodeHooks(ops: MemfsFileNodeOps): void {
    const fileNode = ops;
    const originalSetattr = ops.setattr;
    fileNode.setattr = (node, attr) => {
      originalSetattr.call(ops, node, attr);
      if (attr.size !== undefined) {
        this.onSetattr(node);
      }
    };
  }

  private installFileStreamHooks(ops: MemfsStreamOps): void {
    const fileStream = ops;
    const originalWrite = ops.write;
    const originalClose = ops.close;

    fileStream.write = (stream, buffer, offset, length, position, canOwn) => {
      const written = originalWrite.call(
        ops,
        stream,
        buffer,
        offset,
        length,
        position,
        canOwn,
      );
      this.onWrite(stream);
      return written;
    };

    fileStream.close = (stream) => {
      this.onClose(stream);
      if (originalClose !== undefined) {
        originalClose.call(ops, stream);
      }
    };
  }

  private selfTest(): void {
    if (this.supportChecked) {
      return;
    }
    this.supportChecked = true;

    const probe = `/tmp/pytamaro-workspace-probe-${Math.random()
      .toString(36)
      .slice(2)}`;
    this.probePath = probe;
    this.probeSeen = false;
    try {
      this.fs.writeFile(probe, new Uint8Array(0));
    } finally {
      this.probePath = null;
      try {
        this.fs.unlink(probe);
      } catch {
        // The probe may not exist if the write failed; nothing to clean up.
      }
    }
    this.isSupported = this.probeSeen;
  }

  /* ==== Hook handlers (never throw into Python) ==== */

  private onMknod(node: MemfsNode): void {
    try {
      const sink = this.sink;
      if (sink === null || !this.isFile(node)) {
        return;
      }
      const name = this.relativePath(node);
      if (name !== null) {
        // A new file is empty, but it must become visible immediately.
        this.emit([{ kind: 'put', name, content: new Uint8Array(0) }]);
      }
    } catch {
      // A hook failure must never break the Python syscall.
    }
  }

  private onSetattr(node: MemfsNode): void {
    try {
      if (this.sink === null) {
        return;
      }
      const name = this.reportableName(node);
      if (name === null) {
        return;
      }
      const content = this.content(node);
      if (content !== null) {
        this.emit([{ kind: 'put', name, content }]);
      }
    } catch {
      // Never throw into Python.
    }
  }

  private onClose(stream: MemfsStream): void {
    try {
      if (this.probePath !== null) {
        // The self-test writes outside the root, so it is checked separately.
        if (this.path(stream.node) === this.probePath) {
          this.probeSeen = true;
        }
        return;
      }
      if (this.sink === null || (stream.flags & WRITE_FLAGS_MASK) === 0) {
        return;
      }
      const name = this.reportableName(stream.node);
      if (name === null) {
        this.dirty.delete(stream.node);
        return;
      }
      const content = this.content(stream.node);
      if (content !== null) {
        this.dirty.delete(stream.node);
        this.emit([{ kind: 'put', name, content }]);
      }
    } catch {
      // Never throw into Python.
    }
  }

  private onWrite(stream: MemfsStream): void {
    try {
      if (this.sink === null) {
        return;
      }
      // O(1): path work happens only at flush time.
      this.dirty.add(stream.node);
      if (Date.now() - this.lastFlush >= WRITE_FLUSH_WINDOW_MS) {
        this.flushDirty();
      }
    } catch {
      // Never throw into Python.
    }
  }

  private onUnlink(parent: MemfsNode, name: string): void {
    try {
      if (this.sink === null) {
        return;
      }
      const parentPath = this.path(parent);
      if (parentPath === null) {
        return;
      }
      const name_ = this.relative(`${parentPath}/${name}`);
      if (name_ !== null) {
        this.emit([{ kind: 'remove', name: name_ }]);
      }
    } catch {
      // Never throw into Python.
    }
  }

  private collectRenamedNodes(
    oldNode: MemfsNode,
    newDir: MemfsNode,
    newName: string,
  ): { node: MemfsNode; oldName: string | null }[] | undefined {
    try {
      if (this.sink === null) {
        return undefined;
      }
      const newDirPath = this.path(newDir);
      const targetPath =
        newDirPath === null ? null : `${newDirPath}/${newName}`;
      const oldName = this.relativePath(oldNode);
      const targetInRoot = targetPath !== null && this.isInRoot(targetPath);
      if (oldName === null && !targetInRoot) {
        return undefined;
      }

      const moved: { node: MemfsNode; oldName: string | null }[] = [];
      const collect = (node: MemfsNode): void => {
        if (this.isFile(node)) {
          moved.push({ node, oldName: this.relativePath(node) });
          return;
        }
        const contents = node.contents;
        if (
          contents === undefined ||
          contents === null ||
          ArrayBuffer.isView(contents)
        ) {
          return;
        }
        // Directory: walk node contents directly (no path lookups: the node is
        // temporarily unreachable through the name hash during `rename`).
        Object.values(contents).forEach(collect);
      };
      collect(oldNode);
      return moved;
    } catch {
      return undefined;
    }
  }

  private onRenamed(
    moved: readonly { node: MemfsNode; oldName: string | null }[],
  ): void {
    try {
      if (this.sink === null) {
        return;
      }
      const events: WorkspaceEvent[] = [];
      moved.forEach(({ node, oldName }) => {
        // The node has been reattached, so its path is now the new one.
        const newName = this.relativePath(node);
        this.dirty.delete(node);
        if (oldName !== null) {
          events.push({ kind: 'remove', name: oldName });
        }
        if (newName !== null) {
          const content = this.content(node);
          if (content !== null) {
            events.push({ kind: 'put', name: newName, content });
          }
        }
      });
      this.emit(events);
    } catch {
      // Never throw into Python.
    }
  }

  /* ==== Helpers ==== */

  private emit(events: WorkspaceEvent[]): void {
    if (events.length === 0) {
      return;
    }
    const sink = this.sink;
    if (sink === null) {
      return;
    }
    try {
      sink(events);
    } catch {
      // The sink posts a message; any failure is advisory.
    }
  }

  /**
   * Marks the empty-folder set as stale, flushing it when the throttle allows.
   *
   * Uses node fields only: unlike a filesystem scan, it is safe inside hooks.
   */
  private markFolderChange(): void {
    try {
      if (this.sink === null) {
        return;
      }
      this.foldersDirty = true;
      if (Date.now() - this.lastFolderFlush >= WRITE_FLUSH_WINDOW_MS) {
        this.flushFolders();
      }
    } catch {
      // Never throw into Python.
    }
  }

  /** The complete set of directories that contain no entries, or null. */
  private emptyFolders(): string[] | null {
    const root = this.rootNode;
    if (root === null) {
      return null;
    }
    const folders: string[] = [];
    const walk = (node: MemfsNode, prefix: string): void => {
      const contents = node.contents;
      if (
        contents === undefined ||
        contents === null ||
        ArrayBuffer.isView(contents)
      ) {
        return;
      }
      const names = Object.keys(contents).filter(
        (name) => name !== '.' && name !== '..',
      );
      if (names.length === 0) {
        if (prefix.length > 0) {
          folders.push(prefix);
        }
        return;
      }
      names.forEach((name) => {
        const child = contents[name];
        if (this.fs.isDir(child.mode)) {
          walk(child, prefix.length === 0 ? name : `${prefix}/${name}`);
        }
      });
    };
    try {
      walk(root, '');
    } catch {
      return null;
    }
    return folders;
  }

  private rootNodeOf(): MemfsNode | null {
    try {
      const node = (
        this.fs.lookupPath(this.root, {}) as unknown as { node?: MemfsNode }
      ).node;
      return node ?? null;
    } catch {
      return null;
    }
  }

  private isFile(node: MemfsNode): boolean {
    return this.fs.isFile(node.mode);
  }

  /** A direct child node, read through node fields (never a path lookup). */
  private childNode(parent: MemfsNode, name: string): MemfsNode | null {
    const contents = parent.contents;
    if (
      contents === undefined ||
      contents === null ||
      ArrayBuffer.isView(contents)
    ) {
      return null;
    }
    return contents[name] ?? null;
  }

  private path(node: MemfsNode): string | null {
    try {
      return this.fs.getPath(
        node as unknown as Parameters<FSType['getPath']>[0],
      );
    } catch {
      return null;
    }
  }

  private isInRoot(path: string): boolean {
    return path.startsWith(`${this.root}/`);
  }

  /** The path relative to the workspace root, or null if outside it. */
  private relativePath(node: MemfsNode): string | null {
    const path = this.path(node);
    return path === null ? null : this.relative(path);
  }

  private relative(path: string): string | null {
    return this.isInRoot(path) ? path.slice(this.root.length + 1) : null;
  }

  /** A copy of the node's bytes, or null if they should not be copied. */
  private content(node: MemfsNode): Uint8Array | null {
    const usedBytes = node.usedBytes ?? 0;
    if (usedBytes > MAX_EAGER_BYTES) {
      return null;
    }
    const contents = node.contents;
    if (contents === undefined || contents === null || usedBytes === 0) {
      return new Uint8Array(0);
    }
    // Pyodide's CPython sometimes stores the content in an `Int8Array` view of
    // the wasm heap, and MEMFS may reuse/reallocate the buffer: always copy.
    if (contents instanceof Uint8Array) {
      return contents.subarray(0, usedBytes).slice();
    }
    if (contents instanceof Int8Array) {
      const view = new Uint8Array(
        contents.buffer,
        contents.byteOffset,
        Math.min(usedBytes, contents.byteLength),
      );
      return view.slice();
    }
    return new Uint8Array(0);
  }

  /**
   * The workspace-relative path of a live file node, or null. `unlink` and
   * `rename`-over detach a node without clearing `parent`/`name`, so a path
   * computed from them would point at a different (or no) file.
   */
  private reportableName(node: MemfsNode): string | null {
    const parent = node.parent;
    if (
      !this.isFile(node) ||
      parent === undefined ||
      parent === null ||
      node.name === undefined ||
      this.childNode(parent, node.name) !== node
    ) {
      return null;
    }
    return this.relativePath(node);
  }
}
