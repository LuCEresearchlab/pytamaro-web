import RestartAlt from '@mui/icons-material/RestartAlt';
import NavBarButton from './NavBarButton';

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
    <NavBarButton label={tooltip} onClick={onReset} disabled={!enabled}>
      <RestartAlt />
    </NavBarButton>
  );
}
