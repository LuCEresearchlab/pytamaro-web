import { TipsAndUpdates } from '@mui/icons-material';
import { Alert, Box } from '@mui/material';
import { useContext, useEffect } from 'react';
import { PythonMode } from '../src/execution/codeExecution';
import { ExecutorContext } from '../src/execution/executorContext';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { rapidEvaluatorActivityVariant } from '../src/specialActivities';
import theme from '../src/theme';
import SolitaryCodeCell, { emptySingleCell } from './SolitaryCodeCell';

export default function RapidEvaluator() {
  const initialCodeCells = emptySingleCell();
  const activity = useLocalActivity(
    initialCodeCells,
    rapidEvaluatorActivityVariant,
  );

  // Effect to reset to the initial state when mounting and unmounting.
  useEffect(() => {
    activity.handleResetAllCellsNoConfirm();
    return () => {
      activity.handleResetAllCellsNoConfirm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { executorState } = useContext(ExecutorContext);

  return (
    <Box>
      <Alert
        iconMapping={{
          info: <TipsAndUpdates fontSize='inherit' />,
        }}
        severity='info'
      >
        Type any Python code. The last{' '}
        <span style={{ border: `1px dashed ${theme.palette.primary.main}` }}>
          expression
        </span>{' '}
        will be <strong>evaluated</strong>.
      </Alert>
      <SolitaryCodeCell
        activity={activity}
        activityVariant={rapidEvaluatorActivityVariant}
        runEnabled={executorState.type === 'available'}
        pythonMode={PythonMode.EvalLastExpr}
        elevation={0}
      />
    </Box>
  );
}
