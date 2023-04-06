import { RestartAlt } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

export default function ResetButton({ enabled, onReset }:
{ enabled: boolean, onReset: () => void }) {
  return (
    <Tooltip title="Reset" sx={{ ml: 1 }}>
      <IconButton
        disabled={!enabled}
        onClick={onReset}
        color="neutral"
      >
        <RestartAlt />
      </IconButton>
    </Tooltip>
  );
}
