import { useCallback, useContext, useState } from 'react';
import type { OutputAreaRef } from '../components/input_output/OutputArea';
import {
  type ExecutionResponse,
  isExecutionError,
  isExecutionFailed,
  isExecutionNominal,
  PythonMode,
} from './execution/codeExecution';
import { ExecutorContext } from './execution/executorContext';
import type { WorkspaceChanges } from './execution/messageTypes';
import { isPythonFileName } from './ideFiles';
import type { IdeWorkspace } from './ideWorkspace';
import { extractMetadataForEvent } from './localStorage/schema';
import useLocalProfile from './localStorage/useLocalProfile';
import useInputRequests from './useInputRequests';

/**
 * Runs a single IDE file, exposing the files of the workspace as imports.
 *
 * This is deliberately independent of `ActivitySession`: the IDE has files,
 * not cells, so there is no sequence of sources to execute.
 */
export default function useIdeExecution(
  workspace: IdeWorkspace,
  activeFile: string,
  onWorkspaceChanges: (changes: WorkspaceChanges) => void,
) {
  const { execute, executorState, restart } = useContext(ExecutorContext);
  const { metadata } = useLocalProfile();

  const [executionUUID, setExecutionUUID] = useState<string | undefined>();
  const [executionResponse, setExecutionResponse] = useState<
    ExecutionResponse | undefined
  >();
  const [outputAreaVisible, setOutputAreaVisible] = useState(false);
  const [outputSynced, setOutputSynced] = useState(true);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);

  /** Marks the shown output as stale, e.g., after the file has been edited. */
  const markOutputStale = useCallback(() => {
    setOutputSynced(false);
  }, []);

  /** Discards the execution state, e.g., after the workspace has been reset. */
  const resetExecution = useCallback(() => {
    setExecutionUUID(undefined);
    setExecutionResponse(undefined);
    setOutputAreaVisible(false);
    setOutputSynced(true);
    setIsWaitingForInput(false);
  }, []);

  const showOutputArea = useCallback(() => setOutputAreaVisible(true), []);
  const { setOutputAreaRef: setCellOutputAreaRef, requestInput } =
    useInputRequests(showOutputArea);
  const setOutputAreaRef = useCallback(
    (node: OutputAreaRef | null | undefined) => setCellOutputAreaRef(0, node),
    [setCellOutputAreaRef],
  );

  const run = useCallback(async () => {
    const source = isPythonFileName(activeFile)
      ? workspace.text(activeFile)
      : undefined;
    if (source === undefined || executorState.type !== 'available') {
      return;
    }

    const names = workspace.files();
    const extraFiles = names
      .filter((name) => name !== activeFile)
      .flatMap((name) => {
        const content = workspace.content(name);
        return content === undefined ? [] : [{ name, content }];
      });
    const workspaceFileNames = names;

    const uuid = crypto.randomUUID();
    setExecutionUUID(uuid);
    setExecutionResponse(undefined);
    setOutputSynced(true);
    setIsWaitingForInput(false);

    try {
      const response = await execute(
        [source],
        0,
        metadata.toolbox,
        extraFiles,
        {
          executionUUID: uuid,
          ...extractMetadataForEvent(metadata),
        },
        PythonMode.Exec,
        (_idx, partialResponse) => {
          setExecutionResponse(partialResponse);
          setOutputAreaVisible(true);
          setOutputSynced(true);
        },
        () => {},
        requestInput,
        [activeFile],
        workspaceFileNames,
      );
      const { workspaceChanges, ...executionResult } = response;
      if (workspaceChanges !== undefined) {
        onWorkspaceChanges(workspaceChanges);
      }
      setExecutionResponse(executionResult);
      setOutputAreaVisible(true);
      setOutputSynced(true);
      if (response.type === 'failure') {
        await restart();
      }
    } finally {
      setExecutionUUID(undefined);
    }
  }, [
    activeFile,
    execute,
    executorState.type,
    metadata,
    onWorkspaceChanges,
    restart,
    requestInput,
    workspace,
  ]);

  const executing =
    executionUUID !== undefined && executorState.type === 'executing';
  const executionFinished =
    isExecutionNominal(executionResponse) && executionResponse.completed;
  const finishedWithoutOutput =
    executionFinished &&
    (executionResponse.stdout + executionResponse.stderr).length === 0;
  const executionError =
    isExecutionError(executionResponse) || isExecutionFailed(executionResponse);

  return {
    run,
    runEnabled:
      isPythonFileName(activeFile) &&
      workspace.text(activeFile) !== undefined &&
      executorState.type !== 'loading',
    executing,
    executionFinished,
    finishedWithoutOutput,
    executionError,
    executionResponse,
    outputAreaVisible,
    setOutputAreaVisible,
    outputSynced,
    markOutputStale,
    resetExecution,
    isWaitingForInput,
    setIsWaitingForInput,
    setOutputAreaRef,
  };
}
