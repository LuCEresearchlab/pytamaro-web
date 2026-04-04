import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { Alert, AlertTitle } from '@mui/material';
import { CodeOff } from '@mui/icons-material';

export default function FailedExecutionAlert() {
  const { t } = useLocalTranslation();
  return (
    <Alert
      icon={<CodeOff />}
      severity='error'
    >
      <AlertTitle>{t('executionError.title')}</AlertTitle>
      {t('executionError.message')}
    </Alert>
  );
}
