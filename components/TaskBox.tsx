import {
  Alert, Typography,
} from '@mui/material';
import theme from '../src/theme';

const taskBoxClassName = 'task-box';

export default function TaskBox({
  children,
}:
{ children: React.ReactNode }) {
  return (
    <Alert
      severity="info"
      icon={<Typography sx={{ fontSize: '2rem' }}>🎯</Typography>}
      className={taskBoxClassName}
      sx={{
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 'normal',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        paddingY: 0,
      }}
    >
      {children}
    </Alert>
  );
}
