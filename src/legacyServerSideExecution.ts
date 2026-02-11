import axios from 'axios';
import {
  FailedExecution,
  isCompleted,
  ServerSideExecutionResponse,
} from '../pages/api/execute';
import { ExecutionResponse } from './codeExecution';
import { ToolboxFunction } from './localStorage/schema';
import { PythonFile } from './schemas/activitySchema';

const MARKER_SET_ACTIVE_CELL_PATTERN = /@@@PYTAMARO_SET_ACTIVE_CELL\(\d+\)@@@/;

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

function groupByActiveCell(source: string): string[] {
  return source.split(MARKER_SET_ACTIVE_CELL_PATTERN).slice(1); // Skip the first (there's nothing before the first marker)
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
  const stdoutLines = groupByActiveCell(response.stdout);
  const stderrLines = groupByActiveCell(response.stderr);

  // Reset active cell to 0
  onActiveCellChange(0, 0);

  // Mark previous cells as successful
  for (let i = 0; i < idx; i++) {
    updateExecutionResult(i, {
      type: 'success',
      completed: true,
      stdout: stdoutLines[i] || '',
      stderr: stderrLines[i] || '',
    });
    onActiveCellChange(i, i + 1);
  }

  // Mark last cell as either successful or failing
  setLastCellResult({
    type: response.type,
    completed: true,
    stdout: stdoutLines[idx] || '',
    stderr: stderrLines[idx] || '',
  });
}
