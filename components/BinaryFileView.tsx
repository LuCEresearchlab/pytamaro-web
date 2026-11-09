import { Download, InsertDriveFile } from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { baseName } from '../src/ideFiles';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import BytesFileView from './BytesFileView';

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

type BinaryView = 'preview' | 'bytes';

/**
 * Shows a non-editable file: an image preview (or a placeholder for other
 * formats), or a byte view of the raw bytes, depending on `view`. A download
 * button is always offered. It fills its (positioned) parent.
 */
export default function BinaryFileView({
  name,
  content,
  view,
  onDownload,
}: {
  name: string;
  content: Uint8Array | undefined;
  view: BinaryView;
  onDownload: () => void;
}) {
  const { t } = useLocalTranslation(['ide']);
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
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Stack
        direction='row'
        spacing={1}
        sx={{
          flex: '0 0 auto',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingX: 1.5,
          paddingTop: 1,
        }}
      >
        <Tooltip arrow title={t('downloadFile')}>
          <IconButton
            size='small'
            aria-label={t('downloadFile')}
            onClick={onDownload}
          >
            <Download fontSize='small' />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {view === 'bytes' ? (
          content === undefined ? (
            <Stack
              sx={{
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 3,
                color: 'text.secondary',
              }}
            >
              <Typography variant='body2'>{t('binaryFileHint')}</Typography>
            </Stack>
          ) : (
            <BytesFileView bytes={content} />
          )
        ) : (
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
          </Stack>
        )}
      </Box>
    </Box>
  );
}
