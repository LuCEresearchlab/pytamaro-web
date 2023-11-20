import { HourglassEmpty } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { useRouter } from 'next/router';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

export default function FinishHourOfCodeButton() {
  const { t } = useLocalTranslation(['activityfooter']);
  const targetUrl = 'https://code.org/api/hour/finish';
  const confirm = useConfirm();
  const router = useRouter();
  const handleClick = () => {
    confirm({
      title: t('hourOfCode.title'),
      description: t('hourOfCode.description'),
      confirmationText: t('hourOfCode.confirmationText'),
      cancellationText: t('hourOfCode.cancellationText'),
    }).then(
      () => router.push(targetUrl),
    );
  };
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
      <Button
        variant="outlined"
        color="error"
        startIcon={<HourglassEmpty />}
        onClick={handleClick}
      >
        {t('hourOfCode.finish')}
      </Button>
    </Box>
  );
}
