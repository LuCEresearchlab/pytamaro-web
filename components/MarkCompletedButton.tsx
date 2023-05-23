import { PlaylistAdd, PlaylistRemove } from '@mui/icons-material';
import { Button } from '@mui/material';

export default function MarkCompletedButton({ completed, toggleCompleted }:
{ completed: boolean, toggleCompleted: () => void }) {
  return (
    <Button
      variant="contained"
      color={completed ? 'warning' : 'primary'}
      startIcon={completed ? <PlaylistRemove /> : <PlaylistAdd />}
      onClick={toggleCompleted}
    >
      {`${completed ? 'Unmark' : 'Mark'} Activity as Completed`}
    </Button>
  );
}
