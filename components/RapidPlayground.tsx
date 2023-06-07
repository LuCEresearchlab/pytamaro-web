import { TipsAndUpdates } from '@mui/icons-material';
import { Alert, Box } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { CodeCellState } from '../src/localStorage/schema';
import useTemporaryActivity from '../src/localStorage/useTemporaryActivity';
import { rapidPlaygroundActivityVariant } from '../src/specialActivities';
import SolitaryCodeCell from './SolitaryCodeCell';

export default function RapidPlayground({ initialCodeCells, codeCells, setCodeCells } : {
  initialCodeCells: CodeCellState[],
  codeCells: CodeCellState[],
  setCodeCells: Dispatch<SetStateAction<CodeCellState[]>>,
}) {
  const activity = useTemporaryActivity(
    initialCodeCells,
    codeCells,
    setCodeCells,
    rapidPlaygroundActivityVariant,
  );
  return (
    <Box>
      <Alert
        iconMapping={{
          success: <TipsAndUpdates fontSize="inherit" />,
        }}
      >
        Use this area to execute Python code
        {' '}
        <strong>separately</strong>
        {' '}
        from the current activity.
      </Alert>
      <SolitaryCodeCell
        activity={activity}
        activityVariant={rapidPlaygroundActivityVariant}
      />
    </Box>
  );
}
