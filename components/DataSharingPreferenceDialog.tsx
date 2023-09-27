import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link,
} from '@mui/material';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { myDataPathname } from '../src/urlUtils';

export default function DataSharingPreferenceDialog(props: {
  open: boolean,
  setOpen: (value: boolean) => void,
}) {
  const { open, setOpen } = props;
  const { requestDataSharingPreference, setDataSharingPreference } = useLocalProfile();

  const handleClose = () => {
    if (setOpen !== undefined) {
      setOpen(false);
    }
  };

  const handleOK = () => {
    setDataSharingPreference('yes');
    handleClose();
  };

  const handleLearnMore = () => {
    window.open(`${myDataPathname()}#privacy-settings`, '_blank');
  };

  const shouldDisplay = open !== undefined
    ? open
    : requestDataSharingPreference;

  return (shouldDisplay
    ? (
      <Dialog
        open={shouldDisplay}
        onClose={handleClose}
        maxWidth="md"
      >
        <DialogTitle>Help us do research!</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            PyTamaro Web is a research project run by
            {' '}
            <Link href="https://luce.si.usi.ch/">Luce</Link>
            , the computing education research group at USI in Lugano🇨🇭.
          </DialogContentText>
          <DialogContentText gutterBottom>
            We would like to collect the kind of programs learners write.
          </DialogContentText>
          <DialogContentText>
            We do it
            {' '}
            <b>anonymously: no personal data of any kind is collected</b>
            .
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLearnMore}>Review options</Button>
          <Button onClick={handleOK} variant="contained">OK</Button>
        </DialogActions>
      </Dialog>
    )
    : <div />
  );
}
