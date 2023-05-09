import produce from 'immer';
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import axios from 'axios';
import logAnalyticsEvent, { AnalyticsEventName } from '../analyticsEvent';
import {
  CodeCellState, CodeState, getActivityVariantCodeCellsKey, getDefaultActivityVariantMetadata,
} from './schema';
import useLocalProfile from './useLocalProfile';
import { ActivityVariant, activityVariantId } from '../schemas/activitySchema';
import { EventName, storeDbEvent } from '../storeDbEvent';
import { ExecutionResponse } from '../codeExecution';
import { joinLines } from '../sourceUtils';

export function createCodeCell(source: string, originalIndex: number): CodeCellState {
  return {
    source,
    executionInProgress: false,
    executionResponse: undefined,
    outputAreaVisible: false,
    outputSynced: false,
    originalIndex,
  };
}

async function executeOnServer(sources: string[], idx: number)
  : Promise<ExecutionResponse | undefined> {
  try {
    return (await axios.post('/api/execute', {
      sources,
      idx,
    })).data;
  } catch {
    return undefined;
  }
}

function sourceFromCell(cell: CodeCellState) {
  return cell.source;
}

export function asSingleSource(cells: CodeCellState[]) {
  return joinLines(cells.map(sourceFromCell));
}

export function useLocalActivity(initialCodeCells: CodeState, activityVariant: ActivityVariant) {
  const { metadata, setMetadata } = useLocalProfile();
  const variantId = activityVariantId(activityVariant);
  const variantMetadata = metadata.activities.find((a) => a.id === variantId);
  const [codeCells, setCodeCells] = useLocalStorageState(
    variantMetadata?.codeCellsKey || getActivityVariantCodeCellsKey(variantId),
    { defaultValue: initialCodeCells },
  );
  const localCodeCellsWrongLength = codeCells.length !== initialCodeCells.length;
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
        // Output of all the cells from `idx` is (potentially) no longer in sync
        for (let i = idx; i < codeCells.length; i += 1) {
          draft[i].outputSynced = false;
        }
      }),
    );
  };

  const executionStarted = (idx: number) => {
    setCodeCells(
      (currentCodeCells) => produce(currentCodeCells, (draft) => {
        draft[idx].executionInProgress = true;
      }),
    );
  };

  const executionFinished = (idx: number, response: ExecutionResponse | undefined) => {
    setCodeCells(
      (currentCodeCells) => produce(currentCodeCells, (draft) => {
        draft[idx].executionInProgress = false;
        if (response !== undefined) {
          draft[idx].executionResponse = response;
          draft[idx].outputSynced = true;
          if (response.content?.length > 0) {
            draft[idx].outputAreaVisible = true;
          }
        }
      }),
    );
  };

  const handleExecuteSingleCell = async (idx: number) => {
    executionStarted(idx);
    const response = await executeOnServer(codeCells.map(sourceFromCell), idx);
    executionFinished(idx, response);
    return response !== undefined;
  };

  const handleExecute = async (idx: number) => {
    logAnalyticsEvent(AnalyticsEventName.CodeExecution, { activity: variantId });
    storeDbEvent(EventName.CodeExecution, metadata, {
      sources: codeCells.map(sourceFromCell),
      initialSources: initialCodeCells.map(sourceFromCell),
      requestedCellSequenceNumber: idx,
      activityVariant,
    });
    setNetworkError(false);
    // (Re-Execute) all cells from the first one to the current one, included.
    const successes = [];
    for (let i = 0; i <= idx; i += 1) {
      successes.push(handleExecuteSingleCell(i));
    }
    if ((await Promise.all(successes)).includes(false)) {
      setNetworkError(true);
    }
  };

  const handleToggleOutputArea = (idx: number) => {
    setCodeCells(
      (currentCodeCells) => produce(currentCodeCells, (draft) => {
        draft[idx].outputAreaVisible = !draft[idx].outputAreaVisible;
      }),
    );
  };

  const confirm = useConfirm();
  const handleResetState = () => {
    confirm({ description: 'You are about to reset all the code you have written in this activity. This action cannot be undone! ⚠️', confirmationText: 'Ok, delete my code' })
      .then(() => setCodeCells(initialCodeCells));
  };

  return {
    codeCells,
    completed,
    cellsModified,
    networkError,
    localCodeCellsWrongLength,
    toggleCompleted,
    setNetworkError,
    handleSourceChanged,
    handleExecute,
    handleToggleOutputArea,
    handleResetState,
  };
}
