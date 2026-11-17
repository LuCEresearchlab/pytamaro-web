import { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
import {
  isEmptyWorkspaceChanges,
  mergeWorkspaceChanges,
} from './execution/workspaceChanges';
import { MAIN_BATCH_MS } from './execution/workspaceSyncConstants';
import registerCodeExecutionEvent from './executionEvents';
import { isPythonFileName } from './ideFiles';
import type { IdeWorkspace } from './ideWorkspace';
import { extractMetadataForEvent } from './localStorage/schema';
import useLocalProfile from './localStorage/useLocalProfile';
import { ideActivityVariant } from './specialActivities';
import useInputRequests from './useInputRequests';

function emptyWorkspaceFolders(workspace: IdeWorkspace): string[] {
  const folders = workspace.folders();
  const files = workspace.files();
  return folders.filter((folder) => {
    const prefix = `${folder}/`;
    return (
      !files.some((file) => file.startsWith(prefix)) &&
      !folders.some((other) => other !== folder && other.startsWith(prefix))
    );
  });
}

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
  /**
   * Files that the running program has written. They are read-only in the
   * editor until the run ends, so that user edits cannot be silently
   * overwritten by the next mid-run update.
   */
  const [readOnlyFiles, setReadOnlyFiles] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const lockFiles = useCallback((names: readonly string[]) => {
    if (names.length === 0) {
      return;
    }
    setReadOnlyFiles((current) => {
      if (names.every((name) => current.has(name))) {
        return current;
      }
      const next = new Set(current);
      names.forEach((name) => next.add(name));
      return next;
    });
  }, []);

  /**
   * Mid-run workspace changes waiting to be applied. They are batched with a
   * timer (not `requestAnimationFrame`, which is paused in background tabs).
   */
  const pendingWorkspaceChanges = useRef<WorkspaceChanges | null>(null);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushWorkspaceChanges = useCallback(() => {
    if (flushTimer.current !== null) {
      clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    const pending = pendingWorkspaceChanges.current;
    pendingWorkspaceChanges.current = null;
    if (pending !== null && !isEmptyWorkspaceChanges(pending)) {
      lockFiles(pending.changed.map(({ name }) => name));
      onWorkspaceChanges(pending);
    }
  }, [lockFiles, onWorkspaceChanges]);

  const queueWorkspaceChanges = useCallback(
    (changes: WorkspaceChanges) => {
      pendingWorkspaceChanges.current = mergeWorkspaceChanges(
        pendingWorkspaceChanges.current,
        changes,
      );
      if (flushTimer.current === null) {
        flushTimer.current = setTimeout(() => {
          flushTimer.current = null;
          flushWorkspaceChanges();
        }, MAIN_BATCH_MS);
      }
    },
    [flushWorkspaceChanges],
  );

  // Do not leave a timer behind if the component goes away mid-run.
  useEffect(
    () => () => {
      if (flushTimer.current !== null) {
        clearTimeout(flushTimer.current);
        flushTimer.current = null;
      }
    },
    [],
  );

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
    setReadOnlyFiles(new Set());
  }, []);

  const showOutputArea = useCallback(() => setOutputAreaVisible(true), []);
  const { setOutputAreaRef: setCellOutputAreaRef, requestInput } =
    useInputRequests(showOutputArea);
  const setOutputAreaRef = useCallback(
    (node: OutputAreaRef | null | undefined) => setCellOutputAreaRef(0, node),
    [setCellOutputAreaRef],
  );

  const registerExecutionRequest = useCallback(
    (executionUUID: string) => {
      const source = isPythonFileName(activeFile)
        ? workspace.text(activeFile)
        : undefined;
      if (source === undefined) {
        return;
      }
      // Include in the recorded event as extra files for the Python execution
      // all the workspace files that can be decoded as text
      // (including the file being executed, to record its name/path).
      // Files in a binary format are not captured.
      const extraPythonFiles = workspace.files().flatMap((name) => {
        const content = workspace.text(name);
        return content === undefined ? [] : [{ name, content }];
      });
      registerCodeExecutionEvent({
        metadata,
        sources: [source],
        initialSources: [''],
        requestedCellSequenceNumber: 0,
        toolboxFunctions: metadata.toolbox,
        activityVariant: ideActivityVariant,
        extraPythonFiles,
        liveAnalysis: metadata.liveAnalysis,
        executionUUID,
        pythonMode: PythonMode.Exec,
      });
    },
    [activeFile, metadata, workspace],
  );

  const run = useCallback(
    async (requestedExecutionUUID: string) => {
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
          const content = workspace.bytes(name);
          return content === undefined ? [] : [{ name, content }];
        });
      const workspaceFileNames = names;
      const workspaceFolders = emptyWorkspaceFolders(workspace);

      setExecutionUUID(requestedExecutionUUID);
      setExecutionResponse(undefined);
      setOutputSynced(true);
      setIsWaitingForInput(false);
      setReadOnlyFiles(new Set());
      try {
        const response = await execute(
          [source],
          0,
          metadata.toolbox,
          extraFiles,
          {
            executionUUID: requestedExecutionUUID,
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
          workspaceFolders,
          queueWorkspaceChanges,
        );
        // Apply changes before the authoritative final result, so the
        // final state wins for any path that both touch.
        flushWorkspaceChanges();
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
        // A crashed, stopped or aborted run still keeps whatever it wrote.
        flushWorkspaceChanges();
        setExecutionUUID(undefined);
        setReadOnlyFiles((current) =>
          current.size === 0 ? current : new Set(),
        );
      }
    },
    [
      activeFile,
      execute,
      executorState.type,
      flushWorkspaceChanges,
      metadata,
      onWorkspaceChanges,
      queueWorkspaceChanges,
      restart,
      requestInput,
      workspace,
    ],
  );

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
    registerExecutionRequest,
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
    liveAnalysis: metadata.liveAnalysis,
    setOutputAreaVisible,
    outputSynced,
    markOutputStale,
    resetExecution,
    isWaitingForInput,
    setIsWaitingForInput,
    setOutputAreaRef,
    readOnlyFiles,
  };
}
