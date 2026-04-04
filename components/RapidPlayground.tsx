import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import { Alert, Box } from '@mui/material';
import { useContext } from 'react';
import { ExecutorContext } from '../src/execution/executorContext';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { rapidPlaygroundActivityVariant } from '../src/specialActivities';
import SolitaryCodeCell, { emptySingleCell } from './SolitaryCodeCell';

export default function RapidPlayground() {
  const initialCodeCells = emptySingleCell();
  const activity = useLocalActivity(
    initialCodeCells,
    rapidPlaygroundActivityVariant,
  );

  const { executorState } = useContext(ExecutorContext);

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
        runEnabled={executorState.type === 'available'}
      />
    </Box>
  );
}
