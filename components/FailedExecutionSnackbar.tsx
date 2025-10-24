import { useState } from 'react';
import CustomSnackbar from './CustomSnackbar';

export default function FailedExecutionSnackbar() {
  const [visible, setVisible] = useState(true);
  const message = 'Execution error';
  return (
    <CustomSnackbar
      visible={visible}
      setVisible={setVisible}
      severity='error'
      message={message}
    />
  );
}
