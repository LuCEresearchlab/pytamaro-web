import axios from 'axios';
import { CodeState } from './localStorage/schema';

export interface ExecutionResponse {
  type: string,
  content: any
}

export async function executeCode(source: string)
  : Promise<ExecutionResponse | undefined> {
  try {
    return (await axios.post('/api/execute', {
      code: source,
    })).data;
  } catch (e) {
    return undefined;
  }
}

export function getSourceFirstNCodeCells(codeCells: CodeState, n: number) {
  return codeCells.map((cell) => cell.source).slice(0, n).join('\n');
}

export function getWholeSource(codeCells: CodeState) {
  return getSourceFirstNCodeCells(codeCells, codeCells.length);
}

export function indentSource(source: string) {
  return source.split('\n').map((line) => `\t${line}`).join('\n');
}

export function codeFirstNCells(codeCells: CodeState, n: number) {
  // Creates a Python source with all the previous cells embedded within a
  // context manager that redirects stdout and stderr to None, so that the
  // only the stdout/stderr of the current cell is considered.
  const currentCellSource = codeCells[n].source;
  const previousCellsSource = getSourceFirstNCodeCells(codeCells, n);
  return `
from contextlib import redirect_stdout, redirect_stderr
with redirect_stdout(None), redirect_stderr(None):
${previousCellsSource ? indentSource(previousCellsSource) : '\tpass'}

${currentCellSource}`;
}
