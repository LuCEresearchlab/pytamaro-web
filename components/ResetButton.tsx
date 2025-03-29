import RestartAlt from '@mui/icons-material/RestartAlt';
import { IconButton, Tooltip } from '@mui/material';
import theme from '../src/theme';

export default function ResetButton({
  enabled,
  onReset,
  tooltip,
}: {
  enabled: boolean;
  onReset: () => void;
  tooltip: string;
}) {
  return (
    <Tooltip arrow title={tooltip}>
      <span>
        <IconButton
          sx={{
            color: enabled
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          }}
          disabled={!enabled}
          onClick={onReset}
        >
          <RestartAlt />
        </IconButton>
      </span>
    </Tooltip>
  );
}
