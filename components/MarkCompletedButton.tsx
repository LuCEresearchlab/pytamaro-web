import AddTaskIcon from '@mui/icons-material/AddTask';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { IconButton, Tooltip } from '@mui/material';

export default function MarkCompletedButton({ completed, toggleCompleted }:
{ completed: boolean, toggleCompleted: () => void }) {
  const title = `${completed ? 'Unmark' : 'Mark'} Activity as Completed`;
  return (
    <Tooltip title={title}>
      <IconButton
        sx={{ ml: 1 }}
        onClick={toggleCompleted}
        color={completed ? 'default' : 'neutral'}
      >
        {completed ? <TaskAltIcon /> : <AddTaskIcon /> }
      </IconButton>
    </Tooltip>
  );
}
