import Topo from '@hapi/topo';
import lodash from 'lodash';
import { ToolboxFunction } from './localStorage/schema';
import { PythonName, imported_names } from './python-analyzer/python_analyzer';
import { PythonFile } from './schemas/activitySchema';
import { countLines, emptyLines, joinLines } from './sourceUtils';

const { uniq } = lodash;

export type ExecutionResponse = CompletedExecutionResponse | FailedExecution;

export interface CompletedExecutionResponse {
  type: 'success' | 'error',
  stdout: string,
  stderr: string,
}

export interface FailedExecution {
  type: 'time-limit-exceeded' | 'output-limit-exceeded' | 'network-error',
}

export function isExecutionCompleted(res: ExecutionResponse): res is CompletedExecutionResponse {
  return res.type === 'success' || res.type === 'error';
}

export function isExecutionFailed(res: ExecutionResponse): res is FailedExecution {
  return !isExecutionCompleted(res);
}

/**
 * !!! IMPORTANT !!!
 * Update this version at every change to the process below
 * that turns cells into files for execution.
 */
export const CODE_EXECUTION_CELLS_TO_FILES_VERSION = 7;

export const DRIVER_FILE = 'driver';
export const PREVIOUS_CELLS_FILE = 'previous_cells';
export const CURRENT_CELL_FILE = 'cell';
export const TOOLBOX_FILE = 'toolbox';

export interface BareboneToolboxFunction {
  name: string,
  source: string,
}

// The source of the previous cells is embedded within a context manager that
// redirects stdout and stderr to None, so that the only the stdout/stderr of
// the current cell is considered.
const DRIVER_SOURCE = `
from contextlib import redirect_stdout, redirect_stderr
with redirect_stdout(None), redirect_stderr(None):
    import ${PREVIOUS_CELLS_FILE}
    import builtins
    builtins.__dict__.update(vars(${PREVIOUS_CELLS_FILE}))
import ${CURRENT_CELL_FILE}
`;

function toolboxSingleModuleName(fn: BareboneToolboxFunction) {
  return `${TOOLBOX_FILE}_${fn.name}`;
}

export async function importedToolboxNames(source: string) {
  try {
    const imports: PythonName[] = await imported_names(source);
    const toolboxImports = imports.filter(({ module }) => module === TOOLBOX_FILE);
    return uniq(toolboxImports.map(({ name }) => name));
  } catch {
    return [];
  }
}

async function toposortImports(functions: BareboneToolboxFunction[]) {
  const imports = new Topo.Sorter<string>();
  const deps = await Promise.all(functions.map(async (fn) => (
    { name: fn.name, neededNames: await importedToolboxNames(fn.source) }
  )));
  deps.forEach(({ name, neededNames }) => {
    imports.add(name, { group: name, after: neededNames });
  });
  return imports.nodes.map((name) => functions.find((fn) => fn.name === name) as ToolboxFunction);
}

async function toolboxDriverSource(functions: BareboneToolboxFunction[]) {
  let sortedFunctions = functions;
  try {
    sortedFunctions = await toposortImports(functions);
  } catch {
    // Possibly a circular import
  }
  return joinLines(sortedFunctions.map((fn) => `from ${toolboxSingleModuleName(fn)} import ${fn.name}`));
}

export async function toolboxFiles(
  functions: BareboneToolboxFunction[],
  noEmptyToolbox: boolean = false,
) {
  const singleFiles = functions.map((fn) => ({
    name: `${toolboxSingleModuleName(fn)}.py`,
    content: fn.source,
  }));
  if (singleFiles.length === 0 && noEmptyToolbox) {
    return [];
  }
  const toolboxMainFile = {
    name: `${TOOLBOX_FILE}.py`,
    content: await toolboxDriverSource(functions),
  };
  return [
    toolboxMainFile,
    ...singleFiles,
  ];
}

export async function cellsToFiles(
  sources: string[],
  idx: number,
  toolboxFunctions: BareboneToolboxFunction[],
  extraPythonFiles: PythonFile[],
) {
  // Get the concatenated source of all the previous cells.
  const previousCellsSource = joinLines(sources.slice(0, idx));
  // Get the source of the current cell, padded before with empty lines
  // to account for the previous cells.
  let currentCellSource = sources[idx];
  if (idx > 0) {
    currentCellSource = emptyLines(countLines(previousCellsSource)) + currentCellSource;
  }
  const files = [
    {
      name: `${DRIVER_FILE}.py`,
      content: DRIVER_SOURCE,
    },
    {
      name: `${PREVIOUS_CELLS_FILE}.py`,
      content: previousCellsSource,
    },
    {
      name: `${CURRENT_CELL_FILE}.py`,
      content: currentCellSource,
    },
    ...await toolboxFiles(toolboxFunctions),
    ...extraPythonFiles,
  ];
  // code-runner does not allow empty files, we work around this by including a no-op stmt
  return files.map((file) => ({ ...file, content: file.content || 'pass' }));
}
