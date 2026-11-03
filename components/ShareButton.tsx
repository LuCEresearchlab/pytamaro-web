import ShareIcon from '@mui/icons-material/Share';
import { Button } from '@mui/material';
import { useState } from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import CustomSnackbar from './CustomSnackbar';

export function ShareButton({
  getTextToCopy,
  message,
  failureMessage = undefined,
}: {
  getTextToCopy: () => string | Promise<string>;
  message: string;
  failureMessage?: string;
}) {
  const { t } = useLocalTranslation();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState('');

  const copyTextToClipboard = async () => {
    try {
      const pendingText = Promise.resolve(getTextToCopy());
      if (typeof ClipboardItem !== 'undefined') {
        // Start the write synchronously (inside the user gesture) and let the
        // text resolve later: Safari rejects writes that follow an async gap.
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': pendingText.then(
              (text) => new Blob([text], { type: 'text/plain' }),
            ),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(await pendingText);
      }
      setSnackbarContent(message);
    } catch {
      setSnackbarContent(failureMessage ?? t('errorCategory.other'));
    } finally {
      setSnackbarVisible(true);
    }
  };

  return (
    <>
      <Button
        variant='contained'
        color='primary'
        startIcon={<ShareIcon />}
        onClick={copyTextToClipboard}
        data-testid='share-button'
      >
        <span>{t('share.action')}</span>
      </Button>
      <CustomSnackbar
        visible={snackbarVisible}
        setVisible={setSnackbarVisible}
        severity='success'
        message={snackbarContent}
      />
    </>
  );
}
