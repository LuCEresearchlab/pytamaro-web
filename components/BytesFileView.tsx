import { Box, MenuItem, Select, useTheme } from '@mui/material';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

const ROW_BYTES = 16;
const ROW_HEIGHT = 22;
const OVERSCAN_ROWS = 8;

// Two characters per byte plus the gap between consecutive bytes.
const BYTES_COLUMN_WIDTH = `${ROW_BYTES * 2 + ROW_BYTES - 1}ch`;

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: ROW_HEIGHT,
  whiteSpace: 'pre',
};

const BYTES_STYLE: CSSProperties = {
  display: 'inline-flex',
  flex: '0 0 auto',
  gap: '1ch',
};

const ASCII_STYLE: CSSProperties = {
  display: 'inline-flex',
  flex: '0 0 auto',
  marginLeft: '4ch',
  color: 'var(--mui-palette-text-secondary)',
};

const CELL_STYLE: CSSProperties = {
  display: 'inline-block',
  width: '2ch',
  textAlign: 'center',
  borderRadius: 2,
  cursor: 'default',
  userSelect: 'none',
};

const ASCII_CELL_STYLE: CSSProperties = { ...CELL_STYLE, width: '1ch' };

const HIGHLIGHT_STYLE: CSSProperties = {
  backgroundColor: 'var(--mui-palette-primary-main)',
  color: 'var(--mui-palette-primary-contrastText)',
};

type Decoding = 'ascii' | 'utf-8';

const DECODINGS: readonly { value: Decoding; label: string }[] = [
  { value: 'ascii', label: 'ASCII' },
  { value: 'utf-8', label: 'UTF-8' },
];

interface DecodedChar {
  /** Text to display for this character. */
  text: string;
  /** Index of the first byte of the character. */
  start: number;
  /** Number of bytes occupied by the character. */
  length: number;
}

/** A character cell, a byte that continues a character from a previous row, or
 * a byte that could not be decoded. */
type AsciiCell = DecodedChar | 'continuation' | null;

interface Highlight {
  /** First byte, inclusive. */
  start: number;
  /** Last byte, exclusive. */
  end: number;
}

function formatHex(byte: number): string {
  return byte.toString(16).padStart(2, '0');
}

function displayableByte(byte: number): string {
  return byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : '.';
}

function displayableCodePoint(codePoint: number): string {
  return codePoint < 0x20 ||
    (codePoint >= 0x7f && codePoint < 0xa0) ||
    codePoint === 0xad ||
    codePoint === 0xfeff
    ? '.'
    : String.fromCodePoint(codePoint);
}

function invalidByte(index: number): DecodedChar {
  return { text: '.', start: index, length: 1 };
}

interface Utf8CodePoint {
  codePoint: number;
  /** Number of bytes occupied by the code point. */
  length: number;
}

/** Decodes a single code point, or returns null if the bytes are invalid. */
function decodeUtf8CodePoint(
  bytes: Uint8Array,
  index: number,
): Utf8CodePoint | null {
  const first = bytes[index];
  if (first < 0x80) {
    return { codePoint: first, length: 1 };
  }
  let length: number;
  let codePoint: number;
  let minimum: number;
  if (first >= 0xc2 && first <= 0xdf) {
    length = 2;
    codePoint = first & 0x1f;
    minimum = 0x80;
  } else if (first >= 0xe0 && first <= 0xef) {
    length = 3;
    codePoint = first & 0x0f;
    minimum = 0x800;
  } else if (first >= 0xf0 && first <= 0xf4) {
    length = 4;
    codePoint = first & 0x07;
    minimum = 0x10000;
  } else {
    return null;
  }
  if (index + length > bytes.length) {
    return null;
  }
  for (let offset = 1; offset < length; offset++) {
    const continuation = bytes[index + offset];
    if ((continuation & 0xc0) !== 0x80) {
      return null;
    }
    codePoint = (codePoint << 6) | (continuation & 0x3f);
  }
  if (
    codePoint < minimum ||
    codePoint > 0x10ffff ||
    (codePoint >= 0xd800 && codePoint <= 0xdfff)
  ) {
    return null;
  }
  return { codePoint, length };
}

// Built with the constructor so the `u` flag is allowed even though the project
// targets ES5. Matches Unicode combining marks, including variation selectors.
const COMBINING_MARK = new RegExp('\\p{M}', 'u');
const ZERO_WIDTH_JOINER = 0x200d;

/**
 * A character is a code point together with the combining marks that follow it
 * (for example the variation selector that gives an emoji its emoji
 * presentation). Keeping them together avoids splitting a single glyph over
 * several cells.
 */
function decodeUtf8Char(bytes: Uint8Array, index: number): DecodedChar {
  const first = decodeUtf8CodePoint(bytes, index);
  if (first === null) {
    return invalidByte(index);
  }
  let text = displayableCodePoint(first.codePoint);
  let length = first.length;
  let cursor = index + first.length;
  while (cursor < bytes.length) {
    const next = decodeUtf8CodePoint(bytes, cursor);
    if (next === null) {
      break;
    }
    if (COMBINING_MARK.test(String.fromCodePoint(next.codePoint))) {
      text += String.fromCodePoint(next.codePoint);
      length += next.length;
      cursor += next.length;
      continue;
    }
    if (next.codePoint === ZERO_WIDTH_JOINER) {
      const joined = decodeUtf8CodePoint(bytes, cursor + next.length);
      if (joined === null) {
        break;
      }
      text +=
        String.fromCodePoint(next.codePoint) +
        displayableCodePoint(joined.codePoint);
      length += next.length + joined.length;
      cursor += next.length + joined.length;
      continue;
    }
    break;
  }
  return { text, start: index, length };
}

// How far to look before a row for a character that crosses into it. Must be
// large enough to contain a complete character, including emoji ZWJ sequences.
const LOOKBEHIND_BYTES = 64;

/**
 * Decodes a row of bytes. A character may start before the row or extend past
 * its end; the caller clips it to the row. Characters that start before the row
 * are still returned so that the bytes they occupy within the row can be marked
 * as continuations rather than shown as invalid.
 */
function decodedRow(
  bytes: Uint8Array,
  rowStart: number,
  rowEnd: number,
  decoding: Decoding,
): DecodedChar[] {
  const chars: DecodedChar[] = [];
  if (decoding === 'ascii') {
    for (let index = rowStart; index < rowEnd; index++) {
      chars.push({
        text: displayableByte(bytes[index]),
        start: index,
        length: 1,
      });
    }
    return chars;
  }
  let index = Math.max(0, rowStart - LOOKBEHIND_BYTES);
  while (index < rowEnd) {
    const char = decodeUtf8Char(bytes, index);
    if (char.start + char.length > rowStart) {
      chars.push(char);
    }
    index += char.length;
  }
  return chars;
}

function rowCells(
  bytes: Uint8Array,
  rowStart: number,
  rowEnd: number,
  decoding: Decoding,
): AsciiCell[] {
  const cells: AsciiCell[] = Array.from(
    { length: rowEnd - rowStart },
    () => null,
  );
  for (const char of decodedRow(bytes, rowStart, rowEnd, decoding)) {
    const offset = char.start - rowStart;
    const columnEnd = Math.min(offset + char.length, cells.length);
    if (offset >= 0) {
      cells[offset] = char;
    }
    const firstContinuation = offset >= 0 ? offset + 1 : 0;
    for (let column = firstContinuation; column < columnEnd; column++) {
      cells[column] = 'continuation';
    }
  }
  return cells;
}

function sameRange(a: Highlight | null, b: Highlight): boolean {
  return a !== null && a.start === b.start && a.end === b.end;
}

function overlaps(highlight: Highlight | null, range: Highlight): boolean {
  return (
    highlight !== null &&
    highlight.start < range.end &&
    range.start < highlight.end
  );
}

function contains(highlight: Highlight | null, index: number): boolean {
  return (
    highlight !== null && index >= highlight.start && index < highlight.end
  );
}

/**
 * Shows bytes as a virtualized byte view with their decoding (ASCII by default,
 * or UTF-8 chosen from the header). Hovering or clicking a byte highlights it
 * together with the corresponding character.
 */
export default function BytesFileView({ bytes }: { bytes: Uint8Array }) {
  const theme = useTheme();
  const { t } = useLocalTranslation(['ide']);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [decoding, setDecoding] = useState<Decoding>('ascii');
  const [hovered, setHovered] = useState<Highlight | null>(null);
  const [selected, setSelected] = useState<Highlight | null>(null);
  const highlighted = hovered ?? selected;

  useEffect(() => {
    const element = scrollRef.current;
    if (element === null) {
      return;
    }
    const updateHeight = () => setViewportHeight(element.clientHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setScrollTop(0);
    setHovered(null);
    setSelected(null);
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTop = 0;
    }
  }, [bytes]);

  useEffect(() => {
    setHovered(null);
    setSelected(null);
  }, [decoding]);

  const toggleSelected = (range: Highlight) => {
    setSelected((current) =>
      current !== null &&
      current.start === range.start &&
      current.end === range.end
        ? null
        : range,
    );
  };

  const rowCount = Math.ceil(bytes.length / ROW_BYTES);
  const firstRow = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS,
  );
  const lastRow = Math.min(
    rowCount,
    Math.ceil((scrollTop + Math.max(viewportHeight, ROW_HEIGHT)) / ROW_HEIGHT) +
      OVERSCAN_ROWS,
  );

  const rows: ReactNode[] = [];
  for (let row = firstRow; row < lastRow; row++) {
    const rowStart = row * ROW_BYTES;
    const rowEnd = Math.min(rowStart + ROW_BYTES, bytes.length);
    const cells = rowCells(bytes, rowStart, rowEnd, decoding);
    rows.push(
      <div key={row} style={ROW_STYLE}>
        <span style={BYTES_STYLE}>
          {Array.from({ length: ROW_BYTES }, (_, column) => {
            const index = rowStart + column;
            if (index >= bytes.length) {
              return <span key={column} style={CELL_STYLE} />;
            }
            const range = { start: index, end: index + 1 };
            return (
              <span
                key={column}
                style={{
                  ...CELL_STYLE,
                  ...(contains(highlighted, index)
                    ? HIGHLIGHT_STYLE
                    : undefined),
                }}
                onMouseEnter={() => setHovered(range)}
                onMouseLeave={() =>
                  setHovered((current) =>
                    sameRange(current, range) ? null : current,
                  )
                }
                onClick={() => toggleSelected(range)}
              >
                {formatHex(bytes[index])}
              </span>
            );
          })}
        </span>
        <span style={ASCII_STYLE}>
          {Array.from({ length: ROW_BYTES }, (_, column) => {
            const index = rowStart + column;
            if (index >= bytes.length) {
              return <span key={column} style={ASCII_CELL_STYLE} />;
            }
            const cell = cells[column];
            if (cell === 'continuation') {
              return null;
            }
            const range =
              cell === null
                ? { start: index, end: index + 1 }
                : { start: cell.start, end: cell.start + cell.length };
            const text = cell === null ? '.' : cell.text;
            const width =
              cell === null ? 1 : Math.min(cell.length, cells.length - column);
            return (
              <span
                key={column}
                style={{
                  ...ASCII_CELL_STYLE,
                  width: `${width}ch`,
                  ...(overlaps(highlighted, range)
                    ? HIGHLIGHT_STYLE
                    : undefined),
                }}
                onMouseEnter={() => setHovered(range)}
                onMouseLeave={() =>
                  setHovered((current) =>
                    sameRange(current, range) ? null : current,
                  )
                }
                onClick={() => toggleSelected(range)}
              >
                {text}
              </span>
            );
          })}
        </span>
      </div>,
    );
  }

  return (
    <Box
      data-testid='bytes-file-view'
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.pytamaro.monospaceFontFamily,
        fontSize: 13,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flex: '0 0 auto',
          alignItems: 'center',
          paddingX: 2,
          paddingBottom: 1,
          borderColor: 'divider',
          color: 'primary.main',
          fontWeight: 600,
          userSelect: 'none',
        }}
      >
        <span
          aria-hidden
          style={{ flex: '0 0 auto', width: BYTES_COLUMN_WIDTH }}
        >
          {t('bytes')}
        </span>
        <span style={{ flex: '0 0 auto', marginLeft: '4ch' }}>
          {t('decodeAs')}
        </span>
        <Select
          variant='standard'
          disableUnderline
          size='small'
          value={decoding}
          onChange={(event) => setDecoding(event.target.value as Decoding)}
          inputProps={{ 'aria-label': t('decodeAs') }}
          data-testid='bytes-decode-select'
          sx={{
            marginLeft: '1ch',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            color: 'inherit',
            '& .MuiSelect-select': {
              padding: 0,
              paddingRight: '2ch',
              minHeight: 0,
            },
            '& .MuiSelect-icon': {
              right: 0,
              width: '1.5ch',
              height: '1.5ch',
              top: 'calc(50% - 0.75ch)',
            },
          }}
        >
          {DECODINGS.map(({ value, label }) => (
            <MenuItem key={value} value={value} sx={{ fontSize: 13 }}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box
        ref={scrollRef}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        onMouseLeave={() => setHovered(null)}
        sx={{ flex: 1, minHeight: 0, overflow: 'auto', paddingX: 2 }}
      >
        <div style={{ height: firstRow * ROW_HEIGHT }} />
        {rows}
        <div style={{ height: (rowCount - lastRow) * ROW_HEIGHT }} />
      </Box>
    </Box>
  );
}
