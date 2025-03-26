import { RestartAlt } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import theme from '../src/theme';

export default function ResetButton({ enabled, onReset, tooltip }:
{ enabled: boolean, onReset: () => void, tooltip: string }) {
  return (
    <Tooltip arrow title={tooltip}>
      <span>
        <IconButton
          sx={{
            color: enabled ? theme.palette.text.primary : theme.palette.text.disabled,
            ml: 1,
          }}
          style={enabled ? {} : { pointerEvents: 'none' }}
          onClick={onReset}
        >
          <RestartAlt />
        </IconButton>
      </span>
    </Tooltip>
  );
}
