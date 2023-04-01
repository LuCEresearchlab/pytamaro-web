import produce from 'immer';
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import logEvent, { EventName } from './AnalyticsEvent';

import { executeCode } from './CodeExecution';

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

export function useCodeState(initialCodeCells: CodeState, activityVariantId: string) {
  const KEY = `pytamaro_web_${activityVariantId}_codeCells`;
  const [codeCells, setCodeCells] = useLocalStorageState(KEY, { defaultValue: initialCodeCells });
  const [cellsModified, setCellsModified] = useState(false);
  useEffect(() => {
    setCellsModified(JSON.stringify(codeCells) !== JSON.stringify(initialCodeCells));
  }, [codeCells, initialCodeCells]);

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

  const executionFinished = (idx: number, response: any) => {
    setCodeCells(
      (currentCodeCells) => produce(currentCodeCells, (draft) => {
        draft[idx].executionInProgress = false;
        draft[idx].executionResponse = response;
        draft[idx].outputSynced = true;
        if (response.content.length > 0) {
          draft[idx].outputAreaVisible = true;
        }
      }),
    );
  };

  const handleExecuteSingleCell = async (idx: number) => {
    executionStarted(idx);
    const response = await executeCode(codeFirstNCells(idx));
    executionFinished(idx, response);
  };

  const handleExecute = async (idx: number) => {
    // (Re-Execute) all cells from the first one to the current one, included.
    for (let i = 0; i <= idx; i += 1) {
      handleExecuteSingleCell(i);
    }
    logEvent(EventName.CodeExecution, { activity: activityVariantId });
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
    confirm({ description: 'You will lose all your changes!' })
      .then(() => setCodeCells(initialCodeCells));
  };

  return {
    codeCells,
    cellsModified,
    handleSourceChanged,
    handleExecute,
    handleToggleOutputArea,
    handleResetState,
    getWholeSource,
  };
}
