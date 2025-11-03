import { useEffect } from 'react';
import { ToolboxFunction } from '../src/localStorage/schema';
import {
  ActivityVariant,
  platformConfigWithDefaults,
} from '../src/schemas/activitySchema';
import { useActivity } from '../src/useActivity';
import usePythonAnalyzer from '../src/usePythonAnalyzer';
import CodeCell from './CodeCell';

export function initialStateSingleCell(source: string) {
  return [{ source, originalIndex: 0 }];
}

export function emptySingleCell() {
  return initialStateSingleCell('');
}

export default function SolitaryCodeCell({
  activity,
  activityVariant,
  resetCounter = 0,
  readOnly = false,
  requireNewExecution = false,
  postSourceChange = () => {},
  onExecutionRequest = () => {},
  extraActions = null,
  extraToolboxFunctions = [],
}: {
  activity: ReturnType<typeof useActivity>;
  activityVariant: ActivityVariant;
  resetCounter?: number;
  readOnly?: boolean;
  requireNewExecution?: boolean;
  postSourceChange?: (newSource: string) => void;
  onExecutionRequest?: () => void;
  extraActions?: React.ReactNode;
  extraToolboxFunctions?: ToolboxFunction[];
}) {
  const {
    initialCodeCells,
    codeCells,
    codeExecutionStates,
    handleSourceChanged,
    handleExecute,
  } = activity;
  const source = codeCells[0].source;
  const pythonAnalyzer = usePythonAnalyzer(
    [source],
    0,
    [],
    extraToolboxFunctions,
  );

  useEffect(() => {
    if (requireNewExecution) {
      // Simulate a change in the source code to invalidate an eventual previous execution
      handleSourceChanged(source, 0);
    }
  });

  return (
    <CodeCell
      initialSource={initialCodeCells[0].source}
      currentSource={codeCells[0].source}
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
      sourcesUpTo={[source]}
      resetCounter={resetCounter}
      pythonAnalyzer={pythonAnalyzer}
    />
  );
}
