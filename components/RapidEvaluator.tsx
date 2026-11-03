import { TipsAndUpdates } from '@mui/icons-material';
import { Alert, Box } from '@mui/material';
import { Trans } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';
import { PythonMode } from '../src/execution/codeExecution';
import { ExecutorContext } from '../src/execution/executorContext';
import type { ActivityVariant } from '../src/schemas/activitySchema';
import { rapidEvaluatorActivityVariant } from '../src/specialActivities';
import type { ActivityState } from '../src/useActivity';
import useTemporaryActivity from '../src/useTemporaryActivity';
import SolitaryCodeCell, { emptySingleCell } from './SolitaryCodeCell';

export function EvaluatorContent({
  activityState,
  activityVariant = rapidEvaluatorActivityVariant,
  resetCounter = 0,
  pageStyle = false,
  postSourceChange = () => {},
}: {
  activityState: ActivityState;
  activityVariant?: ActivityVariant;
  resetCounter?: number;
  pageStyle?: boolean;
  postSourceChange?: (newSource: string) => void;
}) {
  const [automaticEvaluation, setAutomaticEvaluation] = useState(true);
  const { executorState } = useContext(ExecutorContext);

  // Effect to reset to the initial state when mounting and unmounting.
  useEffect(() => {
    activityState.handleResetAllCellsNoConfirm();
    return () => {
      activityState.handleResetAllCellsNoConfirm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className='evaluator'>
      <Alert
        iconMapping={{
          info: <TipsAndUpdates fontSize='inherit' />,
        }}
        severity='info'
        sx={
          pageStyle
            ? {
                backgroundColor: 'transparent',
                mb: 3,
                '& .MuiAlert-icon': {
                  display: 'none',
                },
                '.MuiAlert-message': {
                  width: '100%',
                  textAlign: 'center',
                },
              }
            : {}
        }
      >
        <Trans
          i18nKey='rapidEvaluatorHint'
          components={{
            exprSpan: <span className='eval-result-hint' />,
            strong: <strong />,
          }}
        />
      </Alert>
      <SolitaryCodeCell
        activityState={activityState}
        activityVariant={activityVariant}
        resetCounter={resetCounter}
        runEnabled={executorState.type === 'available'}
        pythonMode={PythonMode.EvalLastExpr}
        elevation={0}
        automaticEvaluation={automaticEvaluation}
        setAutomaticEvaluation={setAutomaticEvaluation}
        postSourceChange={postSourceChange}
      />
    </Box>
  );
}

export default function RapidEvaluator() {
  const initialCodeCells = emptySingleCell();
  const activityState = useTemporaryActivity(
    initialCodeCells,
    rapidEvaluatorActivityVariant,
  );

  return <EvaluatorContent activityState={activityState} />;
}
