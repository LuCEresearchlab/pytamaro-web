import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import { Alert, Box } from '@mui/material';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { rapidPlaygroundActivityVariant } from '../src/specialActivities';
import SolitaryCodeCell, { emptySingleCell } from './SolitaryCodeCell';

export default function RapidPlayground() {
  const initialCodeCells = emptySingleCell();
  const activity = useLocalActivity(
    initialCodeCells,
    rapidPlaygroundActivityVariant,
  );
  return (
    <Box>
      <Alert
        iconMapping={{
          success: <TipsAndUpdates fontSize='inherit' />,
        }}
      >
        Use this area to execute Python code <strong>separately</strong> from
        the current activity.
      </Alert>
      <SolitaryCodeCell
        activity={activity}
        activityVariant={rapidPlaygroundActivityVariant}
      />
    </Box>
  );
}
