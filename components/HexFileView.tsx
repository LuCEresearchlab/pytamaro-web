import { Box, useTheme } from '@mui/material';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

const ROW_BYTES = 16;
const ROW_HEIGHT = 22;
const OVERSCAN_ROWS = 8;

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
  marginLeft: '2ch',
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

function formatHex(byte: number): string {
  return byte.toString(16).padStart(2, '0');
}

function formatAscii(byte: number): string {
  return byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : '.';
}

/**
 * Shows bytes as a virtualized hex dump: an offset column, the bytes in hex,
 * and their ASCII translation. Hovering or clicking a byte highlights it
 * together with the corresponding character.
 */
export default function HexFileView({ bytes }: { bytes: Uint8Array }) {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
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
    rows.push(
      <div key={row} style={ROW_STYLE}>
        <span style={BYTES_STYLE}>
          {Array.from({ length: ROW_BYTES }, (_, column) => {
            const index = rowStart + column;
            if (index >= bytes.length) {
              return <span key={column} style={CELL_STYLE} />;
            }
            return (
              <span
                key={column}
                style={{
                  ...CELL_STYLE,
                  marginLeft: column === ROW_BYTES / 2 ? '1ch' : undefined,
                  ...(index === highlighted ? HIGHLIGHT_STYLE : undefined),
                }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() =>
                  setHovered((current) => (current === index ? null : current))
                }
                onClick={() =>
                  setSelected((current) => (current === index ? null : index))
                }
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
            return (
              <span
                key={column}
                style={{
                  ...ASCII_CELL_STYLE,
                  ...(index === highlighted ? HIGHLIGHT_STYLE : undefined),
                }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() =>
                  setHovered((current) => (current === index ? null : current))
                }
                onClick={() =>
                  setSelected((current) => (current === index ? null : index))
                }
              >
                {formatAscii(bytes[index])}
              </span>
            );
          })}
        </span>
      </div>,
    );
  }

  return (
    <Box
      data-testid='hex-file-view'
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.pytamaro.monospaceFontFamily,
        fontSize: 13,
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          flex: '0 0 auto',
          paddingX: 2,
          paddingBottom: 1,
          borderColor: 'divider',
          color: 'primary.main',
          fontWeight: 600,
          userSelect: 'none',
        }}
      >
        <span style={{ flex: '0 0 auto', width: '48ch' }}>Hex</span>
        <span style={{ ...ASCII_STYLE, color: 'inherit' }}>ASCII</span>
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
