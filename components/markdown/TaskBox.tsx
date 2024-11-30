import { Engineering } from '@mui/icons-material';
import {
  Alert,
} from '@mui/material';
import { isValidElement } from 'react';
import theme from '../../src/theme';

const taskBoxClassName = 'task-box';

export default function TaskBox({
  children,
}:
{ children: React.ReactNode }) {
  return (
    <Alert
      severity="info"
      icon={<Engineering />}
      className={taskBoxClassName}
      sx={{
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 'normal',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        paddingY: 0,
        marginY: 2,
        '& .MuiAlert-message': {
          paddingY: 0,
        },
        '& .MuiAlert-icon': {
          paddingY: 0,
          marginTop: '1rem',
        },
      }}
    >
      {isValidElement(children) && children.type === 'p' ? children : <p>{children}</p>}
    </Alert>
  );
}
