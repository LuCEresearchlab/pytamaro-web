import { InsertDriveFile } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import type { FilePreview as FilePreviewInfo } from '../src/ideFileContent';
import { baseName } from '../src/ideFiles';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import BytesFileView from './BytesFileView';
import FilePreview from './FilePreview';

/**
 * Shows a non-editable file: a preview when its format supports one, an
 * explanatory placeholder otherwise, or a byte view of the raw bytes, depending
 * on `view`. It fills its (positioned) parent.
 */
export default function BinaryFileView({
  name,
  content,
  preview,
  view,
}: {
  name: string;
  content: Uint8Array | undefined;
  preview: FilePreviewInfo | undefined;
  view: 'preview' | 'text' | 'bytes';
}) {
  const { t } = useLocalTranslation(['ide']);

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
        ) : view === 'preview' &&
          preview !== undefined &&
          content !== undefined ? (
          <FilePreview
            key={name}
            name={baseName(name)}
            content={content}
            preview={preview}
          />
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
            <Typography variant='h6'>{baseName(name)}</Typography>
            <InsertDriveFile sx={{ fontSize: 56, opacity: 0.4 }} />
            <Typography variant='body2'>{t('binaryFileHint')}</Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
