import produce from 'immer';
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import logEvent, { EventName } from './AnalyticsEvent';

import { ExecutionResponse, executeCode } from './CodeExecution';

const VERSION = '1';

interface Metadata {
  dataModelVersion: string;
  activities: ActivityVariantMetadata[],
}

interface ActivityVariantMetadata {
  id: string,
  codeCellsKey: string,
  cellsModified: boolean,
  completed: boolean,
}

export interface CodeCellState {
  source: string;
  executionInProgress: boolean;
  executionResponse: any;
  outputAreaVisible: boolean;
  outputSynced: boolean;
  originalIndex: number;
}

export type CodeState = CodeCellState[];

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

export const METADATA_KEY = 'pytamaro-web';

function getActivityVariantCodeCellsKey(activityVariantId: string) {
  return `${METADATA_KEY}-${activityVariantId}-codeCells`;
}

export function getDefaultMetadata() : Metadata {
  return {
    dataModelVersion: VERSION,
    activities: [],
  };
}

function getDefaultActivityVariantMetadata(activityVariantId: string)
  : ActivityVariantMetadata {
  return {
    id: activityVariantId,
    codeCellsKey: getActivityVariantCodeCellsKey(activityVariantId),
    cellsModified: false,
    completed: false,
  };
}

export function countLines(source: string) {
  return source.split('\n').length;
}

export function useCodeState(initialCodeCells: CodeState, activityVariantId: string) {
  const [metadata, setMetadata] = useLocalStorageState(METADATA_KEY, {
    defaultValue: getDefaultMetadata(),
  });
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

  const getSourceFirstNCodeCells = (n: number) => codeCells.map((cell) => cell.source).slice(0, n).join('\n');

  const getWholeSource = () => getSourceFirstNCodeCells(codeCells.length);

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
    logEvent(EventName.CodeExecution, { activity: activityVariantId });
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
    getWholeSource,
  };
}
