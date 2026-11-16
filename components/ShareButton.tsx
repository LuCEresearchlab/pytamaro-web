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
  getTextToCopy: () => string;
  message: string;
  failureMessage?: string;
}) {
  const { t } = useLocalTranslation();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState('');

  const copyTextToClipboard = () => {
    navigator.clipboard
      .writeText(getTextToCopy())
      .then(() => setSnackbarContent(message))
      .catch(() =>
        setSnackbarContent(failureMessage ?? t('errorCategory.other')),
      )
      .then(() => setSnackbarVisible(true));
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
