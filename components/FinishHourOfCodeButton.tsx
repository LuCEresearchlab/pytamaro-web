import { HourglassEmpty } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { useRouter } from 'next/router';

export default function FinishHourOfCodeButton() {
  const targetUrl = 'https://code.org/api/hour/finish';
  const confirm = useConfirm();
  const router = useRouter();
  const handleClick = () => {
    confirm({
      title: 'Are you sure?',
      description: 'You are about to end here your Hour of Code!',
      confirmationText: 'Yes, I am finished',
      cancellationText: 'No, go back',
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
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        I'm finished with my Hour of Code
      </Button>
    </Box>
  );
}
