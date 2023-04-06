import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function NetworkErrorSnackbar(props:
{ visible: boolean; setVisible: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { visible, setVisible } = props;

  const handleClose = () => setVisible(false);

  return (
    <div>
      <Snackbar
        open={visible}
        onClose={handleClose}
        autoHideDuration={5000}
      >
        <Alert elevation={6} variant="filled" onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          Network Error
        </Alert>
      </Snackbar>
    </div>
  );
}
