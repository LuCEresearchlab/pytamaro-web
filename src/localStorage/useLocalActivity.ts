import produce from 'immer';
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import axios from 'axios';
import logAnalyticsEvent, { EventName } from '../AnalyticsEvent';

import { ExecutionResponse, codeFirstNCells, executeCode } from '../CodeExecution';
import {
  CodeCellState, CodeState, getActivityVariantCodeCellsKey, getDefaultActivityVariantMetadata,
} from './schema';
import useLocalProfile from './useLocalProfile';

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

export function countLines(source: string) {
  return source.split('\n').length;
}

export function useLocalActivity(initialCodeCells: CodeState, activityVariantId: string) {
  const { metadata, dataSharingAllowed, setMetadata } = useLocalProfile();
  const variantMetadata = metadata.activities.find((a) => a.id === activityVariantId);
  const [codeCells, setCodeCells] = useLocalStorageState(
    variantMetadata?.codeCellsKey || getActivityVariantCodeCellsKey(activityVariantId),
    { defaultValue: initialCodeCells },
  );
  const [networkError, setNetworkError] = useState(false);

  const completed = !!variantMetadata?.completed;
  const cellsModified = !!variantMetadata?.cellsModified;

  const toggleCompleted = () => {
    setMetadata(
      produce((draft) => {
        const draftVariantMetadata = draft.activities.find((a) => a.id === activityVariantId);
        if (draftVariantMetadata) {
          draftVariantMetadata.completed = !draftVariantMetadata.completed;
        } else {
          const newVariantMetadata = getDefaultActivityVariantMetadata(activityVariantId);
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
        const draftVariantMetadata = draft.activities.find((a) => a.id === activityVariantId);
        if (draftVariantMetadata) {
          draftVariantMetadata.cellsModified = newCellsModified;
        } else {
          const newVariantMetadata = getDefaultActivityVariantMetadata(activityVariantId);
          newVariantMetadata.cellsModified = newCellsModified;
          draft.activities.push(newVariantMetadata);
        }
      }),
    );
  }, [codeCells, initialCodeCells, activityVariantId, setMetadata]);

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
          if (response.content.length > 0) {
            draft[idx].outputAreaVisible = true;
          }
        }
      }),
    );
  };

  const getSourceFirstNCodeCells = (n: number) => codeCells.map((cell) => cell.source).slice(0, n).join('\n');

  const handleExecuteSingleCell = async (idx: number) => {
    executionStarted(idx);
    // Get the concatenated source of all the previous cells.
    const previousCellsSource = getSourceFirstNCodeCells(idx);
    // Get the source of the current cell, padded before with empty lines
    // to account for the previous cells.
    const currentCellSource = codeCells[idx].source;
    const paddedCurrentCellSource = idx === 0
      ? currentCellSource
      : '\n'.repeat(countLines(previousCellsSource)) + codeCells[idx].source;
    const response = await executeCode(previousCellsSource, paddedCurrentCellSource);
    executionFinished(idx, response);
    return response !== undefined;
  };

  const handleExecute = async (idx: number) => {
    logAnalyticsEvent(EventName.CodeExecution, { activity: activityVariantId });
    if (dataSharingAllowed) {
      axios.post('/api/events/codeExecution', {
        uuid: metadata.userUuid,
        code: codeFirstNCells(codeCells, idx),
        activityVariant: activityVariantId,
      }).catch(() => {}); // don't bother if this fails
    }
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
    toggleCompleted,
    setNetworkError,
    handleSourceChanged,
    handleExecute,
    handleToggleOutputArea,
    handleResetState,
  };
}
