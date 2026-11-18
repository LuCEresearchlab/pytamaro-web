/**
 * An IDE file: raw bytes, plus the path relative to the root of the IDE
 * workspace (which may contain slashes).
 *
 * Whether the bytes are shown as text, as a preview, or as binary is a view
 * decision (see `ideFileContent.viewKind` and `ideFileContent.filePreview`),
 * not a property of the file.
 */
export type IdeFile = {
  path: string;
  content: Uint8Array;
};

/** Whether `name` denotes a Python source file, judged by its extension. */
export function isPythonFileName(name: string): boolean {
  return name.endsWith('.py') || name.endsWith('.pyi') || name.endsWith('.pyw');
}

/** Whether a stored value is a valid IDE file. */
export function isIdeFile(value: unknown): value is IdeFile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { path, content } = value as Partial<IdeFile>;
  return typeof path === 'string' && content instanceof Uint8Array;
}

/**
 * Normalizes a user-provided relative path.
 *
 * Returns undefined for absolute paths, empty segments, `.`/`..`, or paths
 * with a trailing slash.
 */
export function normalizeWorkspacePath(input: string): string | undefined {
  const path = input.trim().replaceAll('\\', '/');
  if (path.length === 0 || path.startsWith('/')) {
    return undefined;
  }
  const segments = path.split('/');
  if (
    segments.some(
      (segment) => segment.length === 0 || segment === '.' || segment === '..',
    )
  ) {
    return undefined;
  }
  return segments.join('/');
}

/** The last segment of `path`. */
export function baseName(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx < 0 ? path : path.slice(idx + 1);
}

/**
 * Whether inserting `path` would conflict with an existing path: either it
 * already exists, or one of the two is a directory prefix of the other.
 */
export function pathConflicts(
  path: string,
  existing: Iterable<string>,
): boolean {
  for (const other of Array.from(existing)) {
    if (
      other === path ||
      other.startsWith(`${path}/`) ||
      path.startsWith(`${other}/`)
    ) {
      return true;
    }
  }
  return false;
}
