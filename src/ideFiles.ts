/**
 * An IDE file: either UTF-8 text (edited in Monaco) or raw bytes (shown in the
 * file tree, but not editable).
 *
 * `path` is relative to the root of the IDE workspace and may contain slashes.
 */
export type IdeFile = {
  path: string;
  content: string | Uint8Array;
};

const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true });
const UTF8_ENCODER = new TextEncoder();

/** Whether `name` denotes a Python source file, judged by its extension. */
export function isPythonFileName(name: string): boolean {
  return name.endsWith('.py') || name.endsWith('.pyi') || name.endsWith('.pyw');
}

/** Whether `content` is text (as opposed to raw bytes). */
export function isTextContent(content: string | Uint8Array): content is string {
  return typeof content === 'string';
}

/**
 * Decodes `bytes` as UTF-8 text, or returns undefined if they are not valid
 * UTF-8 (or contain NUL, which is a strong hint of binary content).
 */
export function decodeUtf8(bytes: Uint8Array): string | undefined {
  try {
    const text = UTF8_DECODER.decode(bytes);
    return text.includes('\u0000') ? undefined : text;
  } catch {
    return undefined;
  }
}

/** Encodes text as UTF-8 bytes. */
function encodeUtf8(text: string): Uint8Array {
  return UTF8_ENCODER.encode(text);
}

/** The bytes of `content`, encoding text as UTF-8. */
export function contentBytes(content: string | Uint8Array): Uint8Array {
  return isTextContent(content) ? encodeUtf8(content) : content;
}

/** Classifies raw bytes as text when possible, and as binary otherwise. */
export function fileFromBytes(path: string, bytes: Uint8Array): IdeFile {
  const text = decodeUtf8(bytes);
  return { path, content: text ?? bytes };
}

/** Whether two contents are equal. */
export function sameContent(
  a: string | Uint8Array,
  b: string | Uint8Array,
): boolean {
  if (isTextContent(a) || isTextContent(b)) {
    return a === b;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((byte, idx) => byte === b[idx]);
}

/** Whether a stored value is a valid IDE file. */
export function isIdeFile(value: unknown): value is IdeFile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { path, content } = value as Partial<IdeFile>;
  return (
    typeof path === 'string' &&
    (typeof content === 'string' || content instanceof Uint8Array)
  );
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
