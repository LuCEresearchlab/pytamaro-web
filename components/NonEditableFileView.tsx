import { InsertDriveFile } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import type { FilePreview as FilePreviewInfo } from '../src/ideFileContent';
import { baseName } from '../src/ideFiles';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import BytesFileView from './BytesFileView';
import FilePreview from './FilePreview';

export type FileViewMode = 'text' | 'preview' | 'bytes';

export default function NonEditableFileView({
  name,
  content,
  preview,
  view,
}: {
  name: string;
  content: Uint8Array | undefined;
  preview: FilePreviewInfo | undefined;
  view: FileViewMode;
}) {
  const { t } = useLocalTranslation(['ide']);

  const showPreview =
    view === 'preview' && preview !== undefined && content !== undefined;
  const showBytes = view === 'bytes' && content !== undefined;

  return (
    <Box sx={{ position: 'absolute', inset: 0 }}>
      {showPreview && (
        <FilePreview
          key={name}
          name={baseName(name)}
          content={content}
          preview={preview}
        />
      )}
      {showBytes && <BytesFileView bytes={content} />}
      {!showBytes && !showPreview && (
        <Stack
          sx={{
            height: '100%',
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
  );
}
