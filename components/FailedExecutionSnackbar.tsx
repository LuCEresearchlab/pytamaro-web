import { useState } from 'react';
import { FailedExecution } from '../src/codeExecution';
import CustomSnackbar from './CustomSnackbar';

export default function FailedExecutionSnackbar({ res }: { res: FailedExecution }) {
  const [visible, setVisible] = useState(true);
  let message = 'Network error';
  if (res.type === 'time-limit-exceeded') {
    message = 'Execution time limit exceeded';
  } else if (res.type === 'output-limit-exceeded') {
    message = 'Output size limit exceeded';
  }
  return <CustomSnackbar visible={visible} setVisible={setVisible} severity="error" message={message} />;
}
