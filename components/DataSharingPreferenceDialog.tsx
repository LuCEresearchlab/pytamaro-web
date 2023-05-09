import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from 'next/link';
import useLocalProfile from '../src/localStorage/useLocalProfile';

export default function DataSharingPreferenceDialog() {
  const { requestDataSharingPreference, setDataSharingPreference } = useLocalProfile();

  const handleOK = () => {
    setDataSharingPreference('yes');
  };

  const handleLearnMore = () => {
    window.open('/my-data#privacy-settings', '_blank');
  };

  return (requestDataSharingPreference
    ? (
      <Dialog open={requestDataSharingPreference} maxWidth="md">
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
