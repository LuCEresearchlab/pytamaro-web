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
        backgroundColor: theme.pytamaro.palette.background.light,
        marginY: 2,
      }}
    >
      <AlertTitle>{t('yourTask')}</AlertTitle>
      <Box
        sx={{
          marginTop: '1em',

          '& > *:last-child': {
            marginBottom: 0,
          },
        }}
      >
        {children}
      </Box>
    </Alert>
  );
}
