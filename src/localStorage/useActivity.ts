import axios from 'axios';
import produce from 'immer';
import { useConfirm } from 'material-ui-confirm';
import {
  Dispatch, SetStateAction, useEffect, useState,
} from 'react';
import useSessionStorageState from 'use-session-storage-state';
import logAnalyticsEvent, { AnalyticsEventName } from '../analyticsEvent';
import { ExecutionResponse, importedToolboxNames } from '../codeExecution';
import { ActivityVariant, activityVariantId } from '../schemas/activitySchema';
import { joinLines } from '../sourceUtils';
import { EventName, storeDbEvent } from '../storeDbEvent';
import {
  CodeCellExecutionState,
  CodeCellState, Metadata, ToolboxFunction,
  getDefaultActivityVariantMetadata,
} from './schema';
import useLocalToolbox from './useLocalToolbox';

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
  const functions = await Promise.all(names.map((name) => getFromToolbox(name)));
  return functions.filter((f): f is ToolboxFunction => f !== undefined);
}

export async function transitivelyImportedToolboxFunctions(
  source: string,
  getFromToolbox: (name: string) => ToolboxFunction | undefined,
  alreadyImported: ToolboxFunction[] = [],
) : Promise<ToolboxFunction[]> {
  const newlyImportedFunctions = (await importedToolboxFunctions(source, getFromToolbox))
    .filter((fn) => !alreadyImported.includes(fn));
  const importsOfImports = await Promise.all(
    newlyImportedFunctions.map((fn) => (
      transitivelyImportedToolboxFunctions(
        fn.source,
        getFromToolbox,
        [...alreadyImported, ...newlyImportedFunctions],
      )
    )),
  );
  return [...newlyImportedFunctions, ...importsOfImports.flat()];
}

async function executeOnServer(
  sources: string[],
  idx: number,
  toolboxFunctions: ToolboxFunction[],
)
  : Promise<ExecutionResponse> {
  try {
    return (await axios.post('/api/execute', {
      sources,
      idx,
      toolboxFunctions,
    })).data;
  } catch {
    return { type: 'network-error', content: '' };
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
  preExecute: () => ToolboxFunction | undefined = () => undefined,
  postExecuteSingleCell:
  (idx: number, executionResponse: ExecutionResponse) => void = () => {},
) {
  const { getFunction } = useLocalToolbox();
  const variantId = activityVariantId(activityVariant);
  const variantMetadata = metadata.activities.find((a) => a.id === variantId);

  const initialCodeExecutionStates = () => Array(initialCodeCells.length).fill(undefined)
    .map(initialCodeExecutionState);

  const [codeExecutionStates, setCodeExecutionStates] = useSessionStorageState(
    `pytamaro-web-execution-${variantId}`,
    { defaultValue: initialCodeExecutionStates() },
  );
  const [networkError, setNetworkError] = useState(false);

  const completed = !!variantMetadata?.completed;
  const cellsModified = !!variantMetadata?.cellsModified;

  const toggleCompleted = () => {
    setMetadata(
      produce((draft) => {
        const draftVariantMetadata = draft.activities.find((a) => a.id === variantId);
        if (draftVariantMetadata) {
          draftVariantMetadata.completed = !draftVariantMetadata.completed;
        } else {
          const newVariantMetadata = getDefaultActivityVariantMetadata(variantId);
          newVariantMetadata.completed = !newVariantMetadata.completed;
          draft.activities.push(newVariantMetadata);
        }
      }),
    );
  };

  /* Check if code cells have been modified (compared to their initial state) */
  useEffect(() => {
    const newCellsModified = JSON.stringify(codeCells) !== JSON.stringify(initialCodeCells);
    setMetadata(
      produce((draft) => {
        const draftVariantMetadata = draft.activities.find((a) => a.id === variantId);
        if (draftVariantMetadata) {
          draftVariantMetadata.cellsModified = newCellsModified;
        } else {
          const newVariantMetadata = getDefaultActivityVariantMetadata(variantId);
          newVariantMetadata.cellsModified = newCellsModified;
          draft.activities.push(newVariantMetadata);
        }
      }),
    );
  }, [codeCells, initialCodeCells, variantId, setMetadata]);

  const handleSourceChanged = (newSource: string, idx: number) => {
    setCodeCells(
      (currentCodeCells) => produce(currentCodeCells, (draft) => {
        draft[idx].source = newSource;
      }),
    );
    setCodeExecutionStates(
      (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
        // Output of all the cells from `idx` is (potentially) no longer in sync
        for (let i = idx; i < codeCells.length; i += 1) {
          draft[i].outputSynced = false;
        }
      }),
    );
  };

  const sourcesUpTo = (idx: number) => codeCells.slice(0, idx + 1).map(sourceFromCell);

  const executionStarted = (idx: number) => {
    setCodeExecutionStates(
      (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
        draft[idx].executionInProgress = true;
      }),
    );
  };

  const executionFinished = (idx: number, response: ExecutionResponse | undefined) => {
    setCodeExecutionStates(
      (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
        draft[idx].executionInProgress = false;
        if (response !== undefined) {
          if (response.type === 'network-error') {
            setNetworkError(true);
          } else {
            draft[idx].executionResponse = response;
            draft[idx].outputSynced = true;
            draft[idx].outputAreaVisible = response.content.length > 0;
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
    const response = await executeOnServer(sources, idx, toolboxFunctions);
    executionFinished(idx, response);
    postExecuteSingleCell(idx, response);
    return response !== undefined;
  };

  const handleExecute = async (idx: number) => {
    const extraToolboxFn = preExecute();

    const functionLookup = (name: string) => {
      if (extraToolboxFn && extraToolboxFn.name === name) {
        return extraToolboxFn;
      }
      return getFunction(name);
    };

    const sources = sourcesUpTo(idx);
    const toolboxFunctions = await transitivelyImportedToolboxFunctions(
      joinLines(sources),
      functionLookup,
    );
    logAnalyticsEvent(AnalyticsEventName.CodeExecution, { activity: variantId });
    storeDbEvent(EventName.CodeExecution, metadata, {
      sources,
      initialSources: initialCodeCells.map(sourceFromCell),
      requestedCellSequenceNumber: idx,
      toolboxFunctions,
      activityVariant,
    });
    setNetworkError(false);
    // (Re-)Execute all cells from the first one to the current one, included.
    const successes = [];
    for (let i = 0; i <= idx; i += 1) {
      successes.push(handleExecuteSingleCell(sources, toolboxFunctions, i));
    }
    if ((await Promise.all(successes)).includes(false)) {
      setNetworkError(true);
    }
  };

  const handleToggleOutputArea = (idx: number) => {
    setCodeExecutionStates(
      (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
        draft[idx].outputAreaVisible = !draft[idx].outputAreaVisible;
      }),
    );
  };

  const confirm = useConfirm();
  const handleResetAllCellsNoConfirm = () => {
    setCodeCells(initialCodeCells);
    setCodeExecutionStates(initialCodeExecutionStates());
  };

  const handleResetSingleCell = (idx: number) => {
    confirm({ description: 'You are about to reset the code in this cell. Other cells will be left unchanged. This action cannot be undone! ⚠️', confirmationText: 'Ok, delete my code' })
      .then(() => {
        setCodeCells(
          (currentCodeCells) => produce(currentCodeCells, (draft) => {
            draft[idx] = initialCodeCells[idx];
          }),
        );
        setCodeExecutionStates(
          (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
            draft[idx] = initialCodeExecutionState();
          }),
        );
      });
  };

  return {
    codeCells,
    codeExecutionStates,
    completed,
    cellsModified,
    networkError,
    sourcesUpTo,
    toggleCompleted,
    setNetworkError,
    handleSourceChanged,
    handleExecute,
    handleToggleOutputArea,
    handleResetAllCellsNoConfirm,
    handleResetSingleCell,
  };
}
