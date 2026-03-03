import produce from 'immer';
import { debounce, uniqBy } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import useSessionStorageState from 'use-session-storage-state';
import { OutputAreaRef } from '../components/input_output/OutputArea';
import { FailedExecution } from '../pages/api/execute';
import logAnalyticsEvent, { AnalyticsEventName } from './analyticsEvent';
import {
  ExecutionResponse,
  importedToolboxNames,
  isExecutionNominal,
} from './codeExecution';
import { executeServerSide } from './legacyServerSideExecution';
import {
  CodeCellExecutionState,
  CodeCellState,
  Metadata,
  ToolboxFunction,
  extractMetadataForEvent,
  getDefaultActivityVariantMetadata,
} from './localStorage/schema';
import useLocalToolbox from './localStorage/useLocalToolbox';
import { PyodideWorkerClientContext } from './pyodide-execution/pyodideWorkerClient';
import {
  ActivityVariant,
  PythonFile,
  activityVariantId,
} from './schemas/activitySchema';
import { EventName, storeDbEvent } from './storeDbEvent';

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
  initialCodeCells: CodeCellState[],
  codeCells: CodeCellState[],
  setCodeCells: Dispatch<SetStateAction<CodeCellState[]>>,
  metadata: Metadata,
  setMetadata: Dispatch<SetStateAction<Metadata>>,
  activityVariant: ActivityVariant,
  extraPythonFiles: PythonFile[],
  getExtraToolboxFunction: () => ToolboxFunction | undefined = () => undefined,
  postExecuteSingleCell: (
    idx: number,
    executionResponse: ExecutionResponse,
  ) => void = () => {},
) {
  const { getFunction } = useLocalToolbox();
  const variantId = activityVariantId(activityVariant);
  const variantMetadata = metadata.activities.find((a) => a.id === variantId);

  const { isReady, isExecuting, execute, restart } = useContext(
    PyodideWorkerClientContext,
  );

  const initialCodeExecutionStates = () =>
    Array(initialCodeCells.length)
      .fill(undefined)
      .map(initialCodeExecutionState);

  const [codeExecutionStates, setCodeExecutionStates] = useSessionStorageState(
    `pytamaro-web-executionv2-${variantId}`,
    { defaultValue: initialCodeExecutionStates() },
  );

  const restartWorkerAndMarkExecutionAsStopped = useCallback(() => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        for (let idx = 0; idx < draft.length; idx += 1) {
          draft[idx].executionUUID = undefined;
        }
      }),
    );
    restart(metadata);
  }, [restart, setCodeExecutionStates, metadata]);

  const completed = !!variantMetadata?.completed;
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
    if (codeCells.length === 0 && !completed) {
      markAsCompleted();
    }
  }, [codeCells, completed, markAsCompleted]);

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

  // Small debounce because this is potentially called on every keystroke.
  // The setters persist data on Local/Session Storage
  // and we don't want to write synchronously too often.
  const handleSourceChanged = debounce((newSource: string, idx: number) => {
    setCodeCells((currentCodeCells) =>
      produce(currentCodeCells, (draft) => {
        draft[idx].source = newSource;
      }),
    );
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        // Output of all the cells from `idx` is (potentially) no longer in sync
        for (let i = idx; i < codeCells.length; i += 1) {
          draft[i].outputSynced = false;
        }
      }),
    );
  }, 50);

  const sourcesUpTo = (idx: number) =>
    codeCells.slice(0, idx + 1).map(sourceFromCell);

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
          if (response.type === 'success' && idx === codeCells.length - 1) {
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

  const retrieveToolboxSources = async (idx: number, sources: string[]) => {
    const extraToolboxFn = getExtraToolboxFunction();

    const functionLookup = (name: string) => {
      if (extraToolboxFn && extraToolboxFn.name === name) {
        return extraToolboxFn;
      }
      return getFunction(name);
    };

    const toolboxFunctionsByCell = await Promise.all(
      sources.map((source) =>
        transitivelyImportedToolboxFunctions(source, functionLookup),
      ),
    );
    const toolboxFunctions = uniqBy(
      toolboxFunctionsByCell.flat(),
      (fn) => fn.name,
    );
    return toolboxFunctions;
  };

  const handleExecutionRequestEvent = async (
    idx: number,
    executionUUID: string,
  ) => {
    const sources = sourcesUpTo(idx);
    const toolboxFunctions = await retrieveToolboxSources(idx, sources);
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
    });
  };

  const handleExecute = async (
    idx: number,
    executionUUID: string,
    getOutputRef: (execIdx: number) => OutputAreaRef | null,
  ) => {
    if (!isReady) {
      // eslint-disable-next-line no-console
      console.error('Aborting execution request. Not ready');
      return;
    }
    if (isExecuting) {
      // eslint-disable-next-line no-console
      console.error(
        'Aborting execution request. Another execution is in progress',
      );
      return;
    }

    const sources = sourcesUpTo(idx);
    const toolboxFunctions = await retrieveToolboxSources(idx, sources);

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

    // Legacy code path for transition period
    if (metadata.executionMode === 'sse') {
      const setLastCodeCellResponse = (response: ExecutionResponse) => {
        executionFinished(activeCodeCell, response);
        postExecuteSingleCell(activeCodeCell, response);
      };
      const onRemoteFailure = (response: FailedExecution) => {
        const errorMessage =
          response.type === 'time-limit-exceeded'
            ? 'Execution time limit exceeded'
            : response.type === 'output-limit-exceeded'
              ? 'Output size limit exceeded'
              : 'Network error';
        const execResponse: ExecutionResponse = {
          type: 'error',
          completed: true,
          stdout: '',
          stderr: errorMessage,
        };
        setCodeExecutionStates((currentCodeExecutionStates) =>
          produce(currentCodeExecutionStates, (draft) => {
            for (let i = 0; i <= idx; i += 1) {
              draft[i].outputSynced = false;
              draft[i].executionUUID = undefined;
              draft[i].executionResponse = {
                type: 'error',
                completed: true,
                stdout: '',
                stderr: '',
              };
            }
          }),
        );
        setLastCodeCellResponse(execResponse);
      };
      executeServerSide(
        sources,
        idx,
        toolboxFunctions,
        extraPythonFiles,
        newPartialExecutionResult,
        onActiveCellChange,
        setLastCodeCellResponse,
        onRemoteFailure,
      );
      return;
    }

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
      newPartialExecutionResult,
      onActiveCellChange,
      getOutputRef,
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
    setCodeCells(initialCodeCells);
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
        setCodeCells((currentCodeCells) =>
          produce(currentCodeCells, (draft) => {
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
    initialCodeCells,
    codeCells,
    codeExecutionStates,
    completed,
    cellsModified,
    sourcesUpTo,
    handleSourceChanged,
    handleExecutionRequestEvent,
    handleExecute,
    handleToggleOutputArea,
    handleResetAllCellsNoConfirm,
    handleResetSingleCell,
    handleResetSingleCellExecutionState,
    handleRestartPyodide,
  };
}
