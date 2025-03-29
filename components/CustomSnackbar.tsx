import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';

export default function CustomSnackbar(props: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  severity: AlertColor;
  message: string;
}) {
  const { visible, setVisible, severity, message } = props;

  const handleClose = () => setVisible(false);

  return (
    <div>
      <Snackbar open={visible} onClose={handleClose} autoHideDuration={5000}>
        <Alert
          elevation={6}
          variant='filled'
          onClose={handleClose}
          severity={severity}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}
