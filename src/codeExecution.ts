import { countLines, emptyLines } from './sourceUtils';

export interface ExecutionResponse {
  type: string,
  content: string,
}

/**
 * !!! IMPORTANT !!!
 * Update this version at every change to the process below
 * that turns cells into files for execution.
 */
export const CODE_EXECUTION_CELLS_TO_FILES_VERSION = 2;

const DRIVER_FILE = 'driver';
const PREVIOUS_CELLS_FILE = 'previous_cells';
const CURRENT_CELL_FILE = 'cell';

// The source of the previous cells is embedded within a context manager that
// redirects stdout and stderr to None, so that the only the stdout/stderr of
// the current cell is considered.
const DRIVER_SOURCE = `
import friendly
friendly.install()
friendly.set_formatter("dark", color_system="truecolor")
friendly.set_include("friendly_tb")
friendly.exclude_file_from_traceback('/home/glot/${DRIVER_FILE}.py')
from contextlib import redirect_stdout, redirect_stderr
with redirect_stdout(None), redirect_stderr(None):
    import ${PREVIOUS_CELLS_FILE}
    import builtins
    builtins.__dict__.update(vars(${PREVIOUS_CELLS_FILE}))
import ${CURRENT_CELL_FILE}
`;

export function cellsToFiles(sources: string[], idx: number) {
  // Get the concatenated source of all the previous cells.
  const previousCellsSource = sources.slice(0, idx).join('\n');
  // Get the source of the current cell, padded before with empty lines
  // to account for the previous cells.
  let currentCellSource = sources[idx];
  if (idx > 0) {
    currentCellSource = emptyLines(countLines(previousCellsSource)) + currentCellSource;
  }
  return [
    {
      name: `${DRIVER_FILE}.py`,
      content: DRIVER_SOURCE,
    },
    {
      name: `${PREVIOUS_CELLS_FILE}.py`,
      content: previousCellsSource || 'pass',
    },
    {
      name: `${CURRENT_CELL_FILE}.py`,
      content: currentCellSource,
    },
  ];
}
