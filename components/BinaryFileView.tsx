import { Download, InsertDriveFile } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { baseName } from '../src/ideFiles';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

/** Image formats that browsers display natively, by lowercase extension. */
const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
};

function imageType(name: string): string | undefined {
  return name.includes('.')
    ? IMAGE_TYPES[name.split('.').pop()?.toLowerCase() ?? '']
    : undefined;
}

/**
 * Shows a non-editable file: an image preview for image formats, otherwise a
 * placeholder. A download button is always offered. It fills its (positioned)
 * parent and centers its content.
 */
export default function BinaryFileView({
  name,
  content,
  onDownload,
}: {
  name: string;
  content: Uint8Array | undefined;
  onDownload: () => void;
}) {
  const { t } = useLocalTranslation(['common']);
  const mime = imageType(name);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (mime === undefined || content === undefined) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(
      new Blob([new Uint8Array(content)], { type: mime }),
    );
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [content, mime]);

  return (
    <Stack
      sx={{
        position: 'absolute',
        inset: 0,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        padding: 3,
        textAlign: 'center',
        color: 'text.secondary',
        overflow: 'auto',
      }}
    >
      {url === null ? (
        <>
          <Typography variant='h6'>{baseName(name)}</Typography>
          <InsertDriveFile sx={{ fontSize: 56, opacity: 0.4 }} />
          <Typography variant='body2'>{t('binaryFileHint')}</Typography>
        </>
      ) : (
        <Box
          component='img'
          src={url}
          alt={baseName(name)}
          sx={{ maxWidth: '100%', minHeight: 0, objectFit: 'contain' }}
        />
      )}
      <Button variant='outlined' startIcon={<Download />} onClick={onDownload}>
        {t('downloadFile')}
      </Button>
    </Stack>
  );
}
