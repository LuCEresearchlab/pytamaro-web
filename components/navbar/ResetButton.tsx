import RestartAlt from '@mui/icons-material/RestartAlt';
import NavBarButton from './NavBarButton';

export default function ResetButton({
  enabled,
  onReset,
  tooltip,
  testId = undefined,
}: {
  enabled: boolean;
  onReset: () => void;
  tooltip: string;
  testId?: string;
}) {
  return (
    <NavBarButton
      label={tooltip}
      onClick={onReset}
      disabled={!enabled}
      testId={testId}
    >
      <RestartAlt />
    </NavBarButton>
  );
}
