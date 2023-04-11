import produce from 'immer';
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import logEvent, { EventName } from './AnalyticsEvent';

import { ExecutionResponse, executeCode } from './CodeExecution';

const VERSION = '1';

interface Metadata {
  version: string;
  activities: ActivityMetadata[],
}

interface ActivityMetadata {
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

function getDefaultKey(activityVariantId: string) {
  return `pytamaro_web_${activityVariantId}_codeCells`;
}

export function getDefaultMetadata() : Metadata {
  return {
    version: VERSION,
    activities: [],
  };
}

export function getDefaultActivityMetadata(activityVariantId: string) : ActivityMetadata {
  return {
    id: activityVariantId,
    codeCellsKey: getDefaultKey(activityVariantId),
    cellsModified: false,
    completed: false,
  };
}

export function useCodeState(initialCodeCells: CodeState, activityVariantId: string) {
  const [metadata, setMetadata] = useLocalStorageState('pytamaro_web_metadata', {
    defaultValue: getDefaultMetadata(),
  });
  const activityMetadata = metadata.activities.find((a) => a.id === activityVariantId);
  const [codeCells, setCodeCells] = useLocalStorageState(
    activityMetadata?.codeCellsKey || getDefaultKey(activityVariantId),
    { defaultValue: initialCodeCells },
  );
  const [networkError, setNetworkError] = useState(false);

  const completed = !!activityMetadata?.completed;
  const cellsModified = !!activityMetadata?.cellsModified;

  const toggleCompleted = () => {
    setMetadata(
      produce((draft) => {
        const draftActivityMetadata = draft.activities.find((a) => a.id === activityVariantId);
        if (draftActivityMetadata) {
          draftActivityMetadata.completed = !draftActivityMetadata.completed;
        } else {
          const newActivityMetadata = getDefaultActivityMetadata(activityVariantId);
          newActivityMetadata.completed = !newActivityMetadata.completed;
          draft.activities.push(newActivityMetadata);
        }
      }),
    );
  };

  useEffect(() => {
    const newCellsModified = JSON.stringify(codeCells) !== JSON.stringify(initialCodeCells);
    setMetadata(
      produce((draft) => {
        const draftActivityMetadata = draft.activities.find((a) => a.id === activityVariantId);
        if (draftActivityMetadata) {
          draftActivityMetadata.cellsModified = newCellsModified;
        } else {
          const newActivityMetadata = getDefaultActivityMetadata(activityVariantId);
          newActivityMetadata.cellsModified = newCellsModified;
          draft.activities.push(newActivityMetadata);
        }
      }),
    );
  }, [codeCells, initialCodeCells, activityVariantId, setMetadata]);

  const getSourceFirstNCodeCells = (n: number) => codeCells.map((cell) => cell.source).slice(0, n).join('\n');

  const getWholeSource = () => getSourceFirstNCodeCells(codeCells.length);

  const indentSource = (source: string) => source.split('\n').map((line) => `\t${line}`).join('\n');

  const codeFirstNCells = (n: number) => {
    // Creates a Python source with all the previous cells embedded within a
    // context manager that redirects stdout and stderr to None, so that the
    // only the stdout/stderr of the current cell is considered.
    const currentCellSource = codeCells[n].source;
    const previousCellsSource = getSourceFirstNCodeCells(n);
    return `
from contextlib import redirect_stdout, redirect_stderr
with redirect_stdout(None), redirect_stderr(None):
${previousCellsSource ? indentSource(previousCellsSource) : '\tpass'}

${currentCellSource}`;
  };

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
    const response = await executeCode(codeFirstNCells(idx));
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
