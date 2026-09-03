import { TipsAndUpdates } from '@mui/icons-material';
import { Alert, Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { PythonMode } from '../src/execution/codeExecution';
import { ExecutorContext } from '../src/execution/executorContext';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { rapidEvaluatorActivityVariant } from '../src/specialActivities';
import SolitaryCodeCell, { emptySingleCell } from './SolitaryCodeCell';

export default function RapidEvaluator() {
  const { t } = useLocalTranslation();
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

  const [automaticEvaluation, setAutomaticEvaluation] = useState(true);

  return (
    <Box className='rapid-evaluator'>
      <Alert
        iconMapping={{
          info: <TipsAndUpdates fontSize='inherit' />,
        }}
        severity='info'
      >
        <Trans
          i18nKey='rapidEvaluatorHint'
          t={t}
          components={{
            exprSpan: <span className='eval-result-hint' />,
            strong: <strong />,
          }}
        />
      </Alert>
      <SolitaryCodeCell
        activity={activity}
        activityVariant={rapidEvaluatorActivityVariant}
        runEnabled={executorState.type === 'available'}
        pythonMode={PythonMode.EvalLastExpr}
        elevation={0}
        automaticEvaluation={automaticEvaluation}
        setAutomaticEvaluation={setAutomaticEvaluation}
      />
    </Box>
  );
}
