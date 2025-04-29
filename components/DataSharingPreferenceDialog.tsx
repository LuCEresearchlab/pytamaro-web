/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
} from '@mui/material';
import { Trans } from 'next-i18next';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { myDataPathname } from '../src/urlUtils';

export default function DataSharingPreferenceDialog() {
  const { requestDataSharingPreference, setDataSharingPreference } =
    useLocalProfile();

  const { t } = useLocalTranslation();

  const handleOK = () => {
    setDataSharingPreference('yes');
  };

  const handleLearnMore = () => {
    window.open(`${myDataPathname()}#privacy-settings`, '_blank');
  };

  return requestDataSharingPreference ? (
    <Dialog open={requestDataSharingPreference} maxWidth='md'>
      <DialogTitle>{t('dataSharing.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText gutterBottom>
          <Trans
            t={t}
            i18nKey='dataSharing.researchProject'
            components={{ a: <Link href='https://luce.si.usi.ch/' /> }}
          />
        </DialogContentText>
        <DialogContentText gutterBottom>
          {t('dataSharing.collecting')}
        </DialogContentText>
        <DialogContentText>
          <Trans
            t={t}
            i18nKey='dataSharing.anonymously'
            components={{ strong: <strong /> }}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLearnMore}>
          {t('dataSharing.reviewOptions')}
        </Button>
        <Button onClick={handleOK} variant='contained'>
          {t('dataSharing.OK')}
        </Button>
      </DialogActions>
    </Dialog>
  ) : (
    <div />
  );
}
