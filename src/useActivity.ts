import axios from 'axios';
import produce from 'immer';
import { debounce, uniqBy } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import useSessionStorageState from 'use-session-storage-state';
import logAnalyticsEvent, { AnalyticsEventName } from './analyticsEvent';
import {
  ExecutionResponse,
  FailedExecution,
  importedToolboxNames,
  isExecutionCompleted,
  isExecutionFailed,
} from './codeExecution';
import {
  CodeCellExecutionState,
  CodeCellState,
  Metadata,
  ToolboxFunction,
  getDefaultActivityVariantMetadata,
} from './localStorage/schema';
import useLocalToolbox from './localStorage/useLocalToolbox';
import {
  ActivityVariant,
  PythonFile,
  activityVariantId,
} from './schemas/activitySchema';
import { EventName, storeDbEvent } from './storeDbEvent';

export function initialCodeExecutionState(): CodeCellExecutionState {
  return {
    executionInProgress: false,
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

async function executeOnServer(
  sources: string[],
  idx: number,
  toolboxFunctions: ToolboxFunction[],
  extraPythonFiles: PythonFile[],
): Promise<ExecutionResponse> {
  try {
    const response = await axios.post('/api/execute', {
      sources,
      idx,
      toolboxFunctions,
      extraPythonFiles,
    });
    return response.data;
  } catch {
    return { type: 'network-error' };
  }
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

  const initialCodeExecutionStates = () =>
    Array(initialCodeCells.length)
      .fill(undefined)
      .map(initialCodeExecutionState);

  const [codeExecutionStates, setCodeExecutionStates] = useSessionStorageState(
    `pytamaro-web-executionv2-${variantId}`,
    { defaultValue: initialCodeExecutionStates() },
  );
  const [executionFailed, setExecutionFailed] = useState<
    FailedExecution | undefined
  >(undefined);

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

  const executionStarted = (idx: number) => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        draft[idx].executionInProgress = true;
      }),
    );
  };

  const executionFinished = (
    idx: number,
    response: ExecutionResponse | undefined,
  ) => {
    setCodeExecutionStates((currentCodeExecutionStates) =>
      produce(currentCodeExecutionStates, (draft) => {
        draft[idx].executionInProgress = false;
        if (response !== undefined) {
          if (isExecutionFailed(response)) {
            setExecutionFailed(response);
          } else {
            draft[idx].executionResponse = response;
            draft[idx].outputSynced = true;
            draft[idx].outputAreaVisible =
              isExecutionCompleted(response) &&
              (response.stdout + response.stderr).length > 0;
            // Mark the activity as completed when the last cell has been executed successfully.
            if (response.type === 'success' && idx === codeCells.length - 1) {
              markAsCompleted();
            }
          }
        }
      }),
    );
  };

  const handleExecuteSingleCell = async (
    sources: string[],
    toolboxFunctions: ToolboxFunction[],
    idx: number,
  ) => {
    executionStarted(idx);
    const response = await executeOnServer(
      sources,
      idx,
      toolboxFunctions,
      extraPythonFiles,
    );
    executionFinished(idx, response);
    postExecuteSingleCell(idx, response);
    return response;
  };

  const handleExecute = async (idx: number) => {
    const extraToolboxFn = getExtraToolboxFunction();

    const functionLookup = (name: string) => {
      if (extraToolboxFn && extraToolboxFn.name === name) {
        return extraToolboxFn;
      }
      return getFunction(name);
    };

    const sources = sourcesUpTo(idx);
    const toolboxFunctionsByCell = await Promise.all(
      sources.map((source) =>
        transitivelyImportedToolboxFunctions(source, functionLookup),
      ),
    );
    const toolboxFunctions = uniqBy(
      toolboxFunctionsByCell.flat(),
      (fn) => fn.name,
    );
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
    });
    setExecutionFailed(undefined);
    // (Re-)Execute all cells from the first one to the current one, included.
    const responses = [];
    for (let i = 0; i <= idx; i += 1) {
      responses.push(handleExecuteSingleCell(sources, toolboxFunctions, i));
    }
    const failedResponses = (await Promise.all(responses)).filter(
      isExecutionFailed,
    );
    if (failedResponses.length > 0) {
      setExecutionFailed(failedResponses[0]);
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

  const handleResetSingleCell = (idx: number, postReset: () => void) => {
    confirm({
      description:
        'You are about to reset the code in this cell. Other cells will be left unchanged. This action cannot be undone! ⚠️',
      confirmationText: 'Ok, delete my code',
    }).then(() => {
      setCodeCells((currentCodeCells) =>
        produce(currentCodeCells, (draft) => {
          draft[idx] = initialCodeCells[idx];
        }),
      );
      setCodeExecutionStates((currentCodeExecutionStates) =>
        produce(currentCodeExecutionStates, (draft) => {
          draft[idx] = initialCodeExecutionState();
        }),
      );
      postReset();
    });
  };

  return {
    initialCodeCells,
    codeCells,
    codeExecutionStates,
    completed,
    cellsModified,
    executionFailed,
    sourcesUpTo,
    handleSourceChanged,
    handleExecute,
    handleToggleOutputArea,
    handleResetAllCellsNoConfirm,
    handleResetSingleCell,
  };
}
