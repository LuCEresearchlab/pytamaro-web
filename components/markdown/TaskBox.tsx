import Engineering from '@mui/icons-material/Engineering';
import { Alert, AlertTitle, Box } from '@mui/material';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';

const taskBoxClassName = 'task-box';

export default function TaskBox({ children }: { children: React.ReactNode }) {
  const { t } = useLocalTranslation();
  return (
    <Alert
      severity='info'
      icon={<Engineering />}
      className={taskBoxClassName}
      sx={{
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 'normal',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginY: 2,
      }}
    >
      <AlertTitle>{t('yourTask')}</AlertTitle>
      <Box
        marginTop='1em'
        sx={{
          '& > p:last-child': {
            marginBottom: 0,
          },
        }}
      >
        {children}
      </Box>
    </Alert>
  );
}
