import { CodeCellState } from '../src/localStorage/schema';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { ActivityVariant } from '../src/schemas/activitySchema';
import NetworkErrorSnackbar from './NetworkErrorSnackbar';

export default function ActivityNetworkErrorSnackbar({ activityVariant, initialCodeCells } : {
  activityVariant: ActivityVariant,
  initialCodeCells: CodeCellState[],
}) {
  const { networkError, setNetworkError } = useLocalActivity(initialCodeCells, activityVariant);
  return <NetworkErrorSnackbar visible={networkError} setVisible={setNetworkError} />;
}
