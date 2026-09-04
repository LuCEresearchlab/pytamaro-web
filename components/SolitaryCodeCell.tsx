import { debounce } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { PythonMode } from '../src/execution/codeExecution';
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
  runEnabled = false,
  requireNewExecution = false,
  allowToolboxSave = false,
  postSourceChange = () => {},
  onExecutionRequest = () => {},
  extraActions = null,
  extraToolboxFunctions = [],
  pythonMode = PythonMode.Exec,
  elevation = undefined,
  automaticEvaluation = undefined,
  setAutomaticEvaluation = undefined,
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
  pythonMode?: PythonMode;
  elevation?: number;
  automaticEvaluation?: boolean;
  setAutomaticEvaluation?: (value: boolean) => void;
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
    handleResetSingleCellExecutionState,
    handleExecutionRequestEvent,
    handleExecute,
  } = activity;
  const source = codeCells[0].source;
  const pythonAnalyzer = usePythonAnalyzer([], extraToolboxFunctions);

  const AUTOMATIC_EXECUTION_DEBOUNCE_DELAY = 250;
  const LOG_AUTOMATIC_EXECUTION_DEBOUNCE_DELAY = 5000;

  useEffect(() => {
    if (requireNewExecution) {
      // Simulate a change in the source code to invalidate an eventual previous execution
      handleSourceChanged(source, 0);
    }
  });

  // We "need" this ref to avoid a stale closure in the debounced function below
  // (handleExecute changes on every render, so it cannot be in the dependency array of the useMemo that wraps the debounced function).
  const handleExecuteRef = useRef(handleExecute);
  useEffect(() => {
    handleExecuteRef.current = handleExecute;
  }, [handleExecute]);

  const handleExecutionRequestEventRef = useRef(handleExecutionRequestEvent);
  useEffect(() => {
    handleExecutionRequestEventRef.current = handleExecutionRequestEvent;
  }, [handleExecutionRequestEvent]);

  const debouncedExecuteDirectly = useMemo(
    () =>
      debounce((newSource: string, executionUUID: string) => {
        // Here we are not calling `handleExecutionRequestEvent` because we don't want to log the CodeExecution event
        // for *each* automatic evaluation (it would generate far too many events).
        // Call directly handleExecute() instead, passing the `newSource` to ensure that the latest source is executed
        // (and not the one coming from the React state, which may have not yet been updated).
        handleExecuteRef.current(
          0,
          executionUUID,
          pythonMode,
          () => outputAreaRef.current,
          newSource,
        );
      }, AUTOMATIC_EXECUTION_DEBOUNCE_DELAY),
    [pythonMode],
  );

  const debouncedLogExecutionRequestEvent = useMemo(
    () =>
      debounce((newSource: string, executionUUID: string) => {
        handleExecutionRequestEventRef.current(
          0,
          executionUUID,
          pythonMode,
          newSource,
        );
      }, LOG_AUTOMATIC_EXECUTION_DEBOUNCE_DELAY),
    [pythonMode],
  );

  // Cancel potentially pending debounced functions on unmount.
  useEffect(() => {
    return () => {
      debouncedExecuteDirectly.cancel();
      debouncedLogExecutionRequestEvent.cancel();
    };
  }, [debouncedExecuteDirectly, debouncedLogExecutionRequestEvent]);

  return (
    <CodeCell
      initialSource={initialCodeCells[0].source}
      currentSource={codeCells[0].source}
      codeCellExecutionState={codeExecutionStates[0]}
      onResetExecutionState={() => handleResetSingleCellExecutionState(0)}
      onSourceChanged={(newSource) => {
        handleSourceChanged(newSource, 0, (newSource) => {
          if (automaticEvaluation === true) {
            const executionUUID = crypto.randomUUID();
            debouncedExecuteDirectly(newSource, executionUUID);
            debouncedLogExecutionRequestEvent(newSource, executionUUID);
          }
          postSourceChange(newSource);
        });
      }}
      onExecutionRequested={(executionUUID) => {
        onExecutionRequest();
        return handleExecute(0, executionUUID, pythonMode, getOutputAreaRef);
      }}
      onExecutionRequestEvent={(executionUUID) =>
        handleExecutionRequestEvent(0, executionUUID, pythonMode)
      }
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
      getOutputAreaRef={getOutputAreaRef}
      setOutputAreaRef={(_, node) => setOutputAreaRef(node)}
      pythonMode={pythonMode}
      elevation={elevation}
      automaticEvaluation={automaticEvaluation}
      setAutomaticEvaluation={setAutomaticEvaluation}
    />
  );
}
