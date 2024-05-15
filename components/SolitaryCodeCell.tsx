import { useEffect } from 'react';
import { ActivityVariant, platformConfigWithDefaults } from '../src/schemas/activitySchema';
import { useActivity } from '../src/useActivity';
import CodeCell from './CodeCell';

export function initialStateSingleCell(source: string) {
  return [{ source, originalIndex: 0 }];
}

export function emptySingleCell() {
  return initialStateSingleCell('');
}

export default function SolitaryCodeCell({
  activity, activityVariant, readOnly = false, requireNewExecution = false,
  postSourceChange = () => {}, onExecutionRequest = () => {},
  extraActions = null,
} :
{ activity: ReturnType<typeof useActivity>,
  activityVariant: ActivityVariant,
  readOnly?: boolean,
  requireNewExecution?: boolean,
  postSourceChange?: (newSource: string) => void,
  onExecutionRequest?: () => void,
  extraActions?: React.ReactNode
}) {
  const {
    codeCells, codeExecutionStates,
    handleSourceChanged, handleExecute,
  } = activity;
  useEffect(() => {
    if (requireNewExecution) {
      // Simulate a change in the source code to invalidate an eventual previous execution
      handleSourceChanged(codeCells[0].source, 0);
    }
  });
  return (
    <CodeCell
      codeCellState={codeCells[0]}
      codeCellExecutionState={codeExecutionStates[0]}
      onSourceChanged={(newSource) => {
        handleSourceChanged(newSource, 0);
        postSourceChange(newSource);
      }}
      onExecutionRequested={() => {
        onExecutionRequest();
        return handleExecute(0);
      }}
      firstLineNumber={1}
      activityVariant={activityVariant}
      readOnly={readOnly}
      platformConfig={platformConfigWithDefaults()}
      extraActions={extraActions}
      cumulativeSource={codeCells[0].source}
    />
  );
}
