import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import type { FilePreview as FilePreviewInfo } from '../src/ide/fileContent';
import CsvPreview from './CsvPreview';

/**
 * Renders the preview of a file according to its format. Formats that the
 * browser can display (images, SVG) are rendered from a blob URL; formats that
 * need a custom presentation (such as tables) have their own component.
 */
export default function FilePreview({
  name,
  content,
  preview,
}: {
  name: string;
  content: Uint8Array;
  preview: FilePreviewInfo;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const { kind, mimeType } = preview;
  const needsUrl = kind === 'image' || kind === 'svg';

  useEffect(() => {
    if (!needsUrl) {
      return;
    }
    const objectUrl = URL.createObjectURL(
      new Blob([new Uint8Array(content)], { type: mimeType }),
    );
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [content, mimeType, needsUrl]);

  switch (kind) {
    case 'csv':
      return <CsvPreview name={name} content={content} />;
    case 'image':
    case 'svg':
      return url === null ? null : (
        <Box
          sx={{
            height: '100%',
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: 3,
          }}
        >
          <Box
            component='img'
            src={url}
            alt={name}
            sx={{ maxWidth: '100%', minHeight: 0, objectFit: 'contain' }}
          />
        </Box>
      );
  }
}
