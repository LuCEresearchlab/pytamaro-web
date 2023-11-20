import { RestartAlt } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

export default function ResetButton({ enabled, onReset, tooltip }:
{ enabled: boolean, onReset: () => void, tooltip: string }) {
  return (
    <Tooltip arrow title={tooltip}>
      <span>
        <IconButton
          sx={{ ml: 1 }}
          style={enabled ? {} : { pointerEvents: 'none' }}
          color={enabled ? 'neutral' : 'default'}
          onClick={onReset}
        >
          <RestartAlt />
        </IconButton>
      </span>
    </Tooltip>
  );
}
