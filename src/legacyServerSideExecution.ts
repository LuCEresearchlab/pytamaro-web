import axios from 'axios';
import {
  FailedExecution,
  isCompleted,
  ServerSideExecutionResponse,
} from '../pages/api/execute';
import { ExecutionResponse } from './execution/codeExecution';
import { ToolboxFunction } from './localStorage/schema';
import { PythonFile } from './schemas/activitySchema';

const MARKER_SET_ACTIVE_CELL_PATTERN = /@@@PYTAMARO_SET_ACTIVE_CELL\(\d+\)@@@/;
const MARKER_SET_ACTIVE_CELL_PATTERN_CAPTURING =
  /@@@PYTAMARO_SET_ACTIVE_CELL\((\d+)\)@@@/g;

async function executeOnServer(
  sources: string[],
  idx: number,
  toolboxFunctions: ToolboxFunction[],
  extraPythonFiles: PythonFile[],
): Promise<ServerSideExecutionResponse> {
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

function groupStdoutByActiveCell(stdout: string): string[] {
  // Skip the first (there's nothing before the first marker)
  return stdout.split(MARKER_SET_ACTIVE_CELL_PATTERN).slice(1);
}

function groupStderrByActiveCell(stderr: string, numCells: number): string[] {
  // Skip the first (there's nothing before the first marker)
  const executedCells = stderr.split(MARKER_SET_ACTIVE_CELL_PATTERN).slice(1);
  const numExecuted = executedCells.length;

  if (numExecuted === numCells) {
    return executedCells;
  }

  // Some cells were not executed due to a failure in one of the previous cells
  // we need to first find the last cell we were able to execute...
  const lastCellIdx = stderr
    .matchAll(MARKER_SET_ACTIVE_CELL_PATTERN_CAPTURING)
    .reduce((_, match) => parseInt(match[1], 10), -1);

  // ... then we use the traceback of the last cell in all subsequent ones
  // (to match the behavior of CSE)
  const allCells = new Array<string>(lastCellIdx);
  for (let i = 0; i < numCells; i++) {
    allCells[i] = executedCells[Math.min(numExecuted - 1, i)];
  }
  return allCells;
}

function errorInCurrentCell(cellIdx: number, traceback: string[]): boolean {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const idxInTraceback = traceback.findLastIndex((line) => {
    const matches = MARKER_SET_ACTIVE_CELL_PATTERN_CAPTURING.exec(line);
    if (matches && matches.length === 2) {
      return parseInt(matches[1], 10) === cellIdx;
    }
  });
  return idxInTraceback !== -1;
}

export async function executeServerSide(
  files: string[],
  idx: number,
  toolboxFunctions: ToolboxFunction[],
  extraPythonFiles: PythonFile[],
  updateExecutionResult: (idx: number, response: ExecutionResponse) => void,
  onActiveCellChange: (before: number | null, after: number) => void,
  setLastCellResult: (response: ExecutionResponse) => void,
  setRemoteFailure: (response: FailedExecution) => void,
) {
  const response = await executeOnServer(
    files,
    idx,
    toolboxFunctions,
    extraPythonFiles,
  );

  if (!isCompleted(response)) {
    setRemoteFailure(response);
    return;
  }

  // Process the response and send output to the various cells
  const stdoutLines = groupStdoutByActiveCell(response.stdout);
  const stderrLines = groupStderrByActiveCell(response.stderr, idx + 1);

  // Reset active cell to 0
  onActiveCellChange(0, 0);

  // Mark previous cells as successful
  for (let i = 0; i < idx; i++) {
    const out = i < stdoutLines.length ? stdoutLines[i] : '';
    const err = stderrLines[i];
    const type =
      i < stdoutLines.length && !errorInCurrentCell(i, stderrLines)
        ? 'success'
        : 'error';

    updateExecutionResult(i, {
      type,
      completed: true,
      stdout: out,
      stderr: err,
    });
    onActiveCellChange(i, i + 1);
  }

  // Mark last cell as either successful or failing
  setLastCellResult({
    type: response.type,
    completed: true,
    stdout: idx < stdoutLines.length ? stdoutLines[idx] : '',
    stderr: stderrLines[idx],
  });
}
