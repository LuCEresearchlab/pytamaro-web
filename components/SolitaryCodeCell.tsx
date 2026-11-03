import { debounce } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { PythonMode } from '../src/execution/codeExecution';
import {
  ActivityVariant,
  platformConfigWithDefaults,
} from '../src/schemas/activitySchema';
import { type ActivityState } from '../src/useActivity';
import CodeCell from './CodeCell';
import SaveToToolboxButton from './SaveToToolboxButton';
import { OutputAreaRef } from './input_output/OutputArea';

export function singleCodeCell(source: string) {
  return [{ source, originalIndex: 0 }];
}

export function emptySingleCell() {
  return singleCodeCell('');
}

export default function SolitaryCodeCell({
  activityState,
  activityVariant,
  resetCounter = 0,
  readOnly = false,
  runEnabled = false,
  requireNewExecution = false,
  allowToolboxSave = false,
  postSourceChange = () => {},
  onExecutionRequest = () => {},
  extraActions = null,
  pythonMode = PythonMode.Exec,
  elevation = undefined,
  automaticEvaluation = undefined,
  setAutomaticEvaluation = undefined,
}: {
  activityState: ActivityState;
  activityVariant: ActivityVariant;
  resetCounter?: number;
  readOnly?: boolean;
  runEnabled?: boolean;
  requireNewExecution?: boolean;
  allowToolboxSave?: boolean;
  postSourceChange?: (newSource: string) => void;
  onExecutionRequest?: () => void;
  extraActions?: React.ReactNode;
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
    codeExecutionStates,
    handleInvalidateOutputsFrom,
    handleResetSingleCellExecutionState,
    handleExecutionRequestEvent,
    handleExecute,
    activitySession,
  } = activityState;

  const AUTOMATIC_EXECUTION_DEBOUNCE_DELAY = 250;
  const LOG_AUTOMATIC_EXECUTION_DEBOUNCE_DELAY = 5000;

  const handleInvalidateOutputsFromRef = useRef(handleInvalidateOutputsFrom);
  useEffect(() => {
    handleInvalidateOutputsFromRef.current = handleInvalidateOutputsFrom;
  });

  useEffect(() => {
    if (requireNewExecution) {
      // Invalidate an eventual previous execution
      handleInvalidateOutputsFromRef.current(0);
    }
  }, [requireNewExecution]);

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
      debounce((executionUUID: string) => {
        // Here we are not calling `handleExecutionRequestEvent` because we don't want to log the CodeExecution event
        // for *each* automatic evaluation (it would generate far too many events).
        // Call directly handleExecute() instead.
        handleExecuteRef.current(
          0,
          executionUUID,
          pythonMode,
          () => outputAreaRef.current,
        );
      }, AUTOMATIC_EXECUTION_DEBOUNCE_DELAY),
    [pythonMode],
  );

  const debouncedLogExecutionRequestEvent = useMemo(
    () =>
      debounce((executionUUID: string) => {
        handleExecutionRequestEventRef.current(0, executionUUID, pythonMode);
      }, LOG_AUTOMATIC_EXECUTION_DEBOUNCE_DELAY),
    [pythonMode],
  );

  // Clean up potentially pending debounced functions on unmount.
  useEffect(() => {
    return () => {
      debouncedExecuteDirectly.cancel();
      // flush() to log on close, if any
      debouncedLogExecutionRequestEvent.flush();
    };
  }, [debouncedExecuteDirectly, debouncedLogExecutionRequestEvent]);

  return (
    <CodeCell
      codeCellExecutionState={codeExecutionStates[0]}
      onResetExecutionState={() => handleResetSingleCellExecutionState(0)}
      onSourceChanged={(newSource) => {
        handleInvalidateOutputsFrom(0);
        if (automaticEvaluation === true) {
          const executionUUID = crypto.randomUUID();
          debouncedExecuteDirectly(executionUUID);
          debouncedLogExecutionRequestEvent(executionUUID);
        }
        postSourceChange(newSource);
      }}
      onExecutionRequested={(executionUUID) => {
        onExecutionRequest();
        return handleExecute(0, executionUUID, pythonMode, getOutputAreaRef);
      }}
      onRuntimeErrorDismissed={() => handleInvalidateOutputsFrom(0)}
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
              activitySession={activitySession}
              cellIdx={0}
              originalActivity={activityVariant}
            />
          )}
          {extraActions}
        </>
      }
      resetCounter={resetCounter}
      activitySession={activitySession}
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
