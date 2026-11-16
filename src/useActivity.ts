import produce from 'immer';
import { uniqBy } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import useSessionStorageState from 'use-session-storage-state';
import type { ActivitySession } from './activitySession';
import logAnalyticsEvent, { AnalyticsEventName } from './analyticsEvent';
import {
  ExecutionResponse,
  PythonMode,
  importedToolboxNames,
  isExecutionNominal,
} from './execution/codeExecution';
import { ExecutorContext } from './execution/executorContext';
import { CLIENT_SIDE_EXECUTION_TAG } from './execution/versions';
import {
  CodeCellExecutionState,
  CodeCellState,
  Metadata,
  ToolboxFunction,
  extractMetadataForEvent,
  getDefaultActivityVariantMetadata,
} from './localStorage/schema';
import {
  ActivityVariant,
  PythonFile,
  activityVariantId,
} from './schemas/activitySchema';
import { EventName, storeDbEvent } from './storeDbEvent';
import useInputRequests from './useInputRequests';

function hasOutput(response: ExecutionResponse): boolean {
  return (
    isExecutionNominal(response) &&
    (response.stdout + response.stderr).length > 0
  );
}

export function initialCodeExecutionState(): CodeCellExecutionState {
  return {
    executionUUID: undefined,
    executionResponse: undefined,
    outputAreaVisible: false,
    outputSynced: false,
  };
}

async function importedToolboxFunctions(
  source: string,
  getFromToolbox: (name: string) => ToolboxFunction | undefined,
) {
  const names = await importedToolboxNames(source);
  const functions = await Promise.all(
    names.map((name) => getFromToolbox(name)),
  );
  return functions.filter((f): f is ToolboxFunction => f !== undefined);
}

export async function transitivelyImportedToolboxFunctions(
  source: string,
  getFromToolbox: (name: string) => ToolboxFunction | undefined,
  alreadyImported: ToolboxFunction[] = [],
): Promise<ToolboxFunction[]> {
  const newlyImportedFunctions = (
    await importedToolboxFunctions(source, getFromToolbox)
  ).filter((fn) => !alreadyImported.includes(fn));
  const importsOfImports = await Promise.all(
    newlyImportedFunctions.map((fn) =>
      transitivelyImportedToolboxFunctions(fn.source, getFromToolbox, [
        ...alreadyImported,
        ...newlyImportedFunctions,
      ]),
    ),
  );
  return [...newlyImportedFunctions, ...importsOfImports.flat()];
}

export function sourceFromCell(cell: CodeCellState) {
  return cell.source;
}

export function useActivity(
  activitySession: ActivitySession,
  metadata: Metadata,
  setMetadata: Dispatch<SetStateAction<Metadata>>,
  activityVariant: ActivityVariant,
  extraPythonFiles: PythonFile[],
  postExecuteSingleCell: (
    idx: number,
    executionResponse: ExecutionResponse,
  ) => void = () => {},
) {
  const variantId = activityVariantId(activityVariant);
  const variantMetadata = metadata.activities.find((a) => a.id === variantId);

  const codeCells = useSyncExternalStore(
    activitySession.subscribe,
    activitySession.getCodeCells,
    activitySession.getCodeCells,
  );
  const initialCodeCells = useSyncExternalStore(
    activitySession.subscribe,
    activitySession.getInitialCodeCells,
    activitySession.getInitialCodeCells,
  );

  const { executorState, execute, restart } = useContext(ExecutorContext);

  const initialCodeExecutionStates = () =>
    Array(initialCodeCells.length)
      .fill(undefined)
      .map(initialCodeExecutionState);

  const [storedCodeExecutionStates, setStoredCodeExecutionStates] =
    useSessionStorageState(`pytamaro-web-executionv2-${variantId}`, {
      defaultValue: initialCodeExecutionStates(),
    });
  const codeExecutionStatesRef = useRef(storedCodeExecutionStates);
  useEffect(() => {
    codeExecutionStatesRef.current = storedCodeExecutionStates;
  }, [storedCodeExecutionStates]);
  const setCodeExecutionStates = useCallback(
    (update: SetStateAction<CodeCellExecutionState[]>) => {
      const current = codeExecutionStatesRef.current;
      const next = typeof update === 'function' ? update(current) : update;
      if (Object.is(next, current)) {
        // Avoid writing to session storage if the new value is the same as the old one.
        // This is potentially expensive because it is called on every keystroke and
        // the code execution states contain the base64-encoded PNGs, which can be large.
        return;
      }
      codeExecutionStatesRef.current = next;
      setStoredCodeExecutionStates(next);
    },
    [setStoredCodeExecutionStates],
  );

  const restartWorkerAndMarkExecutionAsStopped = useCallback(() => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        for (let idx = 0; idx < draft.length; idx += 1) {
          draft[idx].executionUUID = undefined;
        }
      }),
    );
    restart();
  }, [restart, setCodeExecutionStates]);

  const showOutputArea = (idx: number) =>
    setCodeExecutionStates((current) =>
      produce(current, (draft) => {
        if (draft[idx] !== undefined) {
          draft[idx].outputAreaVisible = true;
        }
      }),
    );
  const { setOutputAreaRef, requestInput } = useInputRequests(showOutputArea);

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const completed = !!variantMetadata?.completed;
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const cellsModified = !!variantMetadata?.cellsModified;

  const markAsCompleted = useCallback(() => {
    setMetadata(
      produce((draft) => {
        const draftVariantMetadata = draft.activities.find(
          (a) => a.id === variantId,
        );
        if (draftVariantMetadata) {
          draftVariantMetadata.completed = true;
        } else {
          const newVariantMetadata =
            getDefaultActivityVariantMetadata(variantId);
          newVariantMetadata.completed = true;
          draft.activities.push(newVariantMetadata);
        }
      }),
    );
  }, [variantId, setMetadata]);

  useEffect(() => {
    if (activitySession.getCodeCells().length === 0 && !completed) {
      markAsCompleted();
    }
  }, [activitySession, completed, markAsCompleted]);

  const initialCodeCellsSerialized = JSON.stringify(initialCodeCells);
  const codeCellsSerialized = JSON.stringify(codeCells);

  /* Check if code cells have been modified (compared to their initial state) */
  useEffect(() => {
    const newCellsModified = codeCellsSerialized !== initialCodeCellsSerialized;
    setMetadata(
      produce((draft) => {
        const draftVariantMetadata = draft.activities.find(
          (a) => a.id === variantId,
        );
        if (draftVariantMetadata) {
          draftVariantMetadata.cellsModified = newCellsModified;
        } else {
          const newVariantMetadata =
            getDefaultActivityVariantMetadata(variantId);
          newVariantMetadata.cellsModified = newCellsModified;
          draft.activities.push(newVariantMetadata);
        }
      }),
    );
  }, [codeCellsSerialized, initialCodeCellsSerialized, variantId, setMetadata]);

  // For example after a source change,
  // the output of all the cells from `idx` is (potentially) no longer in sync
  const handleInvalidateOutputsFrom = (idx: number) => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        for (let i = idx; i < draft.length; i += 1) {
          draft[i].outputSynced = false;
        }
      }),
    );
  };

  const sourcesUpTo = (idx: number) => activitySession.getSourcesUpTo(idx);

  const executionPartiallyCompleted = (idx: number) => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        if (
          draft[idx].executionResponse &&
          draft[idx].executionResponse?.type !== 'failure'
        ) {
          draft[idx].executionResponse.completed = true;
        }
      }),
    );
  };

  const executionFinished = (
    idx: number,
    response: ExecutionResponse | undefined,
  ) => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        draft[idx].executionUUID = undefined;
        if (response !== undefined) {
          draft[idx].executionResponse = response;
          draft[idx].outputSynced = true;
          draft[idx].outputAreaVisible = hasOutput(response);
          if (
            response.type === 'success' &&
            idx === activitySession.getCodeCells().length - 1
          ) {
            // Mark the activity as completed when the last cell has been executed successfully.
            markAsCompleted();
          } else if (response.type === 'failure') {
            // Pyodide died, we need to restart the worker
            restartWorkerAndMarkExecutionAsStopped();
          }
        }
      }),
    );
  };

  const propagateExecutionResponse = (
    rangeStartExclusive: number,
    rangeEndInclusive: number,
    response: ExecutionResponse,
  ) => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        for (let idx = rangeEndInclusive; idx > rangeStartExclusive; --idx) {
          draft[idx].executionUUID = undefined;
          draft[idx].outputSynced = true;
          draft[idx].outputAreaVisible = true;
          draft[idx].executionResponse = response;
        }
      }),
    );
  };

  const newPartialExecutionResult = (
    idx: number,
    executionResponse: ExecutionResponse | undefined,
  ) => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        if (executionResponse && draft[idx] !== undefined) {
          draft[idx].executionResponse = executionResponse;
          draft[idx].outputSynced = true;
          draft[idx].outputAreaVisible = hasOutput(executionResponse);
        }
      }),
    );
  };

  const retrieveToolboxSources = async (sources: string[]) => {
    // The session already merges the extra functions with the saved toolbox
    // (extras first), so analysis and execution see the same functions.
    const toolboxFunctions = activitySession.getToolboxFunctions();
    const functionLookup = (name: string) =>
      toolboxFunctions.find((fn) => fn.name === name);

    const toolboxFunctionsByCell = await Promise.all(
      sources.map((source) =>
        transitivelyImportedToolboxFunctions(source, functionLookup),
      ),
    );
    return uniqBy(toolboxFunctionsByCell.flat(), (fn) => fn.name);
  };

  const handleExecutionRequestEvent = async (
    idx: number,
    executionUUID: string,
    pythonMode: PythonMode,
  ) => {
    const sources = sourcesUpTo(idx);
    const toolboxFunctions = await retrieveToolboxSources(sources);
    logAnalyticsEvent(AnalyticsEventName.CodeExecution, {
      activity: variantId,
    });
    storeDbEvent(EventName.CodeExecution, metadata, {
      sources,
      initialSources: initialCodeCells.map(sourceFromCell),
      requestedCellSequenceNumber: idx,
      toolboxFunctions,
      activityVariant,
      extraPythonFiles,
      liveAnalysis: metadata.liveAnalysis,
      executionUUID,
      pythonMode,
      clientSideExecutionTag: CLIENT_SIDE_EXECUTION_TAG,
    });
  };

  const handleExecute = async (
    idx: number,
    executionUUID: string,
    pythonMode: PythonMode,
  ) => {
    if (executorState.type === 'loading') {
      // eslint-disable-next-line no-console
      console.error('Aborting execution request. Not ready');
      return;
    }
    if (executorState.type === 'executing') {
      // eslint-disable-next-line no-console
      console.error(
        'Aborting execution request. Another execution is in progress',
      );
      return;
    }

    const sources = sourcesUpTo(idx);
    const toolboxFunctions = await retrieveToolboxSources(sources);

    // (Re-)Execute all cells from the first one to the current one, included.
    // Before starting, we mark the output of these cells as not synced.
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        for (let i = 0; i <= idx; i += 1) {
          draft[i].outputSynced = false;
          draft[i].executionUUID = executionUUID;
        }
      }),
    );

    let activeCodeCell: number = idx;
    const onActiveCellChange = (
      previouslyActive: number | null,
      nowActive: number,
    ) => {
      if (previouslyActive !== null) {
        executionFinished(previouslyActive, undefined);
        executionPartiallyCompleted(previouslyActive);
      }
      activeCodeCell = nowActive;
    };

    const executionMetadata = {
      executionUUID,
      ...extractMetadataForEvent(metadata),
    };

    const response = await execute(
      sources,
      idx,
      toolboxFunctions,
      extraPythonFiles,
      executionMetadata,
      pythonMode,
      newPartialExecutionResult,
      onActiveCellChange,
      requestInput,
    );

    // Mark the "last" cell as complete.
    // The others are handled by the onActiveCellChange function
    // Note that "last" does not necessarily mean cell #idx, but rather
    // the last cell that was executed, hence why we only need to do
    // executionFinished + postExecuteSingleCell here.
    executionFinished(activeCodeCell, response);
    postExecuteSingleCell(activeCodeCell, response);
    // If the execution did not complete successfully and terminated before
    // cell $idx, we need to mark all cells in range ($activeCodeCell, $idx] as
    // "failed"
    if (response.type === 'error' || response.type === 'failure') {
      propagateExecutionResponse(activeCodeCell, idx, response);
    }
  };

  const handleToggleOutputArea = (idx: number) => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        draft[idx].outputAreaVisible = !draft[idx].outputAreaVisible;
      }),
    );
  };

  const confirm = useConfirm();
  const handleResetAllCellsNoConfirm = () => {
    activitySession.setCodeCells(initialCodeCells);
    setCodeExecutionStates(initialCodeExecutionStates());
  };

  const handleResetSingleCellExecutionState = (idx: number) => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        draft[idx] = initialCodeExecutionState();
      }),
    );
  };

  const handleResetSingleCell = (idx: number, postReset: () => void) => {
    confirm({
      description:
        'You are about to reset the code in this cell. Other cells will be left unchanged. This action cannot be undone! ⚠️',
      confirmationText: 'Ok, delete my code',
    }).then(({ confirmed }) => {
      if (confirmed) {
        activitySession.setCodeCells(
          produce(activitySession.getCodeCells(), (draft) => {
            draft[idx] = initialCodeCells[idx];
          }),
        );
        handleResetSingleCellExecutionState(idx);
        postReset();
      }
    });
  };

  const handleRestartPyodide = () =>
    confirm({
      description:
        'You are about to restart the Python environment. All active code executions will be terminated.',
      confirmationText: 'Ok, restart',
    }).then(({ confirmed }) => {
      if (confirmed) {
        restartWorkerAndMarkExecutionAsStopped();
      }
    });

  return {
    activitySession,
    codeCells,
    codeExecutionStates: storedCodeExecutionStates,
    completed,
    cellsModified,
    setOutputAreaRef,
    handleInvalidateOutputsFrom,
    handleExecutionRequestEvent,
    handleExecute,
    handleToggleOutputArea,
    handleResetAllCellsNoConfirm,
    handleResetSingleCell,
    handleResetSingleCellExecutionState,
    handleRestartPyodide,
  };
}

export type ActivityState = ReturnType<typeof useActivity>;
