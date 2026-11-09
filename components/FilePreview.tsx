import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import type { FilePreview as FilePreviewInfo } from '../src/ideFileContent';

/**
 * Renders the preview of a file according to its format. Formats that the
 * browser can display (images, SVG) are rendered from a blob URL; formats that
 * need a custom presentation (such as tables) can be added as new cases.
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

  useEffect(() => {
    const objectUrl = URL.createObjectURL(
      new Blob([new Uint8Array(content)], { type: mimeType }),
    );
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [content, mimeType]);

  switch (kind) {
    case 'image':
    case 'svg':
      return url === null ? null : (
        <Box
          component='img'
          src={url}
          alt={name}
          sx={{ maxWidth: '100%', minHeight: 0, objectFit: 'contain' }}
        />
      );
  }
}
