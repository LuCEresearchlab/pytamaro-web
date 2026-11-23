export const MAX_EDITOR_BYTES = 1024 * 1024;

const UTF8_DECODER = new TextDecoder('utf-8', {
  fatal: true,
  // Keep a leading BOM as U+FEFF, so that decode/encode round-trips exactly.
  ignoreBOM: true,
});
const UTF8_ENCODER = new TextEncoder();

type ImageFormat = {
  extensions: readonly string[];
  magic: readonly number[];
  mime: string;
};

const IMAGE_FORMATS: readonly ImageFormat[] = [
  {
    extensions: ['png'],
    magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    mime: 'image/png',
  },
  {
    extensions: ['jpg', 'jpeg'],
    magic: [0xff, 0xd8, 0xff],
    mime: 'image/jpeg',
  },
  {
    extensions: ['gif'],
    magic: [0x47, 0x49, 0x46, 0x38],
    mime: 'image/gif',
  },
];

/**
 * Strict UTF-8 decode.
 *
 * Returns undefined when the bytes are not valid UTF-8 or contain NUL. A BOM
 * is kept as U+FEFF so that `encodeText(decodeText(bytes))` is exactly `bytes`.
 */
export function decodeText(bytes: Uint8Array): string | undefined {
  try {
    const text = UTF8_DECODER.decode(bytes);
    return text.includes('\u0000') ? undefined : text;
  } catch {
    return undefined;
  }
}

export function encodeText(text: string): Uint8Array {
  return UTF8_ENCODER.encode(text);
}

export function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let idx = 0; idx < a.length; idx += 1) {
    if (a[idx] !== b[idx]) {
      return false;
    }
  }
  return true;
}

function extensionOf(path: string): string {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
}

function hasMagic(bytes: Uint8Array, format: ImageFormat): boolean {
  if (bytes.length < format.magic.length) {
    return false;
  }
  return format.magic.every((byte, idx) => bytes[idx] === byte);
}

/**
 * A way of previewing a file, in addition to or instead of showing its text or
 * raw bytes.
 */
export type FilePreview = {
  kind: 'image' | 'svg' | 'csv';
  /** MIME type to use when rendering or downloading the content. */
  mimeType: string;
};

const SVG_MIME_TYPE = 'image/svg+xml';
const CSV_MIME_TYPE = 'text/csv;charset=utf-8';
const TSV_MIME_TYPE = 'text/tab-separated-values;charset=utf-8';

/** Whether the bytes are CSV/TSV: a small enough file with valid UTF-8 text. */
function isDelimitedText(path: string, bytes: Uint8Array): boolean {
  const extension = extensionOf(path);
  return (
    (extension === 'csv' || extension === 'tsv') &&
    bytes.length <= MAX_EDITOR_BYTES &&
    decodeText(bytes) !== undefined
  );
}

/**
 * Whether the bytes are an SVG document. SVGs are text, so their extension is
 * checked first to avoid decoding every text file.
 */
function isSvg(path: string, bytes: Uint8Array): boolean {
  if (extensionOf(path) !== 'svg') {
    return false;
  }
  const text = decodeText(bytes);
  if (text === undefined) {
    return false;
  }
  const markup = text.replace(/^\uFEFF/, '').trimStart();
  return (
    /<svg[\s>]/.test(markup) &&
    (markup.startsWith('<svg') || markup.startsWith('<?xml'))
  );
}

function detectPreview(
  path: string,
  bytes: Uint8Array,
): FilePreview | undefined {
  const extension = extensionOf(path);
  const imageFormat = IMAGE_FORMATS.find((format) =>
    format.extensions.includes(extension),
  );
  if (imageFormat !== undefined && hasMagic(bytes, imageFormat)) {
    return { kind: 'image', mimeType: imageFormat.mime };
  }
  if (isSvg(path, bytes)) {
    return { kind: 'svg', mimeType: SVG_MIME_TYPE };
  }
  if (isDelimitedText(path, bytes)) {
    return {
      kind: 'csv',
      mimeType: extension === 'tsv' ? TSV_MIME_TYPE : CSV_MIME_TYPE,
    };
  }
  return undefined;
}

// Bytes are immutable by contract, so previews can be cached per byte identity.
const PREVIEW_CACHE = new WeakMap<
  Uint8Array,
  Map<string, FilePreview | null>
>();

/** How to preview the file, or undefined if it cannot be previewed. */
export function filePreview(
  path: string,
  bytes: Uint8Array,
): FilePreview | undefined {
  let byPath = PREVIEW_CACHE.get(bytes);
  if (byPath?.has(path) === true) {
    return byPath.get(path) ?? undefined;
  }

  const preview = detectPreview(path, bytes);
  if (byPath === undefined) {
    byPath = new Map();
    PREVIEW_CACHE.set(bytes, byPath);
  }
  byPath.set(path, preview ?? null);
  return preview;
}

export type ViewKind = 'text' | 'binary';

// Bytes are immutable by contract, so a kind can be cached per byte identity.
const VIEW_KIND_CACHE = new WeakMap<Uint8Array, Map<string, ViewKind>>();

/**
 * Whether the file can be edited as text. Previewability is independent: a file
 * can be both text and previewable (for example an SVG).
 */
export function viewKind(path: string, bytes: Uint8Array): ViewKind {
  let byPath = VIEW_KIND_CACHE.get(bytes);
  const cached = byPath?.get(path);
  if (cached !== undefined) {
    return cached;
  }

  const kind: ViewKind =
    bytes.length <= MAX_EDITOR_BYTES && decodeText(bytes) !== undefined
      ? 'text'
      : 'binary';

  if (byPath === undefined) {
    byPath = new Map();
    VIEW_KIND_CACHE.set(bytes, byPath);
  }
  byPath.set(path, kind);
  return kind;
}
