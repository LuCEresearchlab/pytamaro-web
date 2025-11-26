import { useEffect, useRef } from 'react';
import { ToolboxFunction } from '../src/localStorage/schema';
import {
  ActivityVariant,
  platformConfigWithDefaults,
} from '../src/schemas/activitySchema';
import { useActivity } from '../src/useActivity';
import usePythonAnalyzer from '../src/usePythonAnalyzer';
import CodeCell from './CodeCell';
import SaveToToolboxButton from './SaveToToolboxButton';
import { OutputAreaRef } from './input_output/OutputArea';

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
  runEnabled = true,
  requireNewExecution = false,
  allowToolboxSave = false,
  postSourceChange = () => {},
  onExecutionRequest = () => {},
  extraActions = null,
  extraToolboxFunctions = [],
}: {
  activity: ReturnType<typeof useActivity>;
  activityVariant: ActivityVariant;
  resetCounter?: number;
  readOnly?: boolean;
  runEnabled?: boolean;
  requireNewExecution?: boolean;
  allowToolboxSave?: boolean;
  postSourceChange?: (newSource: string) => void;
  onExecutionRequest?: () => void;
  extraActions?: React.ReactNode;
  extraToolboxFunctions?: ToolboxFunction[];
}) {
  const outputAreaRef = useRef<OutputAreaRef>(null);
  const getOutputAreaRef = () => outputAreaRef.current;
  const setOutputAreaRef = (node: OutputAreaRef | null | undefined) => {
    outputAreaRef.current = node === undefined ? null : node;
  };
  const {
    initialCodeCells,
    codeCells,
    codeExecutionStates,
    handleSourceChanged,
    handleExecute,
  } = activity;
  const source = codeCells[0].source;
  const pythonAnalyzer = usePythonAnalyzer([], extraToolboxFunctions);

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
        return handleExecute(0, getOutputAreaRef);
      }}
      firstLineNumber={1}
      activityVariant={activityVariant}
      readOnly={readOnly}
      runEnabled={runEnabled}
      platformConfig={platformConfigWithDefaults()}
      extraActions={
        <>
          {allowToolboxSave && (
            <SaveToToolboxButton
              pythonAnalyzer={pythonAnalyzer}
              cellIdx={0}
              originalActivity={activityVariant}
            />
          )}
          {extraActions}
        </>
      }
      resetCounter={resetCounter}
      pythonAnalyzer={pythonAnalyzer}
      cellIdx={0}
      setOutputAreaRef={(_, node) => setOutputAreaRef(node)}
    />
  );
}
