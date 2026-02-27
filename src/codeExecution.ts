import Topo from '@hapi/topo';
import lodash from 'lodash';
import { ToolboxFunction } from './localStorage/schema';
import { RunPythonFile } from './pyodide-execution/messagesTypes';
import { findImportedNames } from './python-analyzer/python_analyzer';
import { PythonFile } from './schemas/activitySchema';
import { countLines, emptyLines, joinLines } from './sourceUtils';

const { uniq } = lodash;

export type ExecutionResponse =
  | NominalExecutionResponse
  | FailedExecutionResponse;

export type NominalExecutionResponse = {
  type: 'success' | 'error';
  completed: boolean;
  stdout: string;
  stderr: string;
};

export type FailedExecutionResponse = {
  type: 'failure';
  stdout: string;
  stderr: string;
};

export type LegacyServerSideExecutionFailureResponse = {
  type: 'sse-failure';
  error: 'time-limit-exceeded' | 'output-limit-exceeded' | 'network-error';
};

export function isExecutionNominal(
  res: ExecutionResponse | undefined,
): res is NominalExecutionResponse {
  return isExecutionSuccessful(res) || isExecutionError(res);
}

export function isExecutionSuccessful(
  res: ExecutionResponse | undefined,
): res is NominalExecutionResponse {
  return res?.type === 'success';
}

export function isExecutionError(
  res: ExecutionResponse | undefined,
): res is NominalExecutionResponse {
  return res?.type === 'error';
}

export function isExecutionFailed(
  res: ExecutionResponse | undefined,
): res is FailedExecutionResponse {
  return res?.type === 'failure';
}

/**
 * !!! IMPORTANT !!!
 * Update this version at every change to the process below
 * that turns cells into files for execution.
 */
export const CODE_EXECUTION_CELLS_TO_FILES_VERSION = 9;

export const DRIVER_FILE = 'driver';
export const CELL_FILE = 'cell_';
export const TOOLBOX_FILE = 'toolbox';

export interface BareboneToolboxFunction {
  name: string;
  source: string;
}

// linecache is necessary to improve the traceback (e.g., to show the source code, and possibly also the caret)
// the hack is taken from https://github.com/pyodide/pyodide/blob/3f80192aa814a17dfee7eb20bb24da6509c22049/src/py/_pyodide/_base.py#L312
function driverSource(num_cells: number) {
  return `
from pathlib import Path
from os import chdir, getcwd
from shutil import rmtree
from sys import stderr, stdout
from pytamaro_js_ffi import set_active_cell
import atexit
import linecache

try:
  globals_dict = {}
  def run(name):
      filename = name + ".py"
      source = Path(filename).read_text()
      code = compile(source, filename, "exec")
      linecache.cache[filename] = [lambda: source]
      exec(code, globals_dict)

  for idx in range(0, ${num_cells}):
    if stdout is not None:
      stdout.flush()
    if stderr is not None:
      stderr.flush()
    set_active_cell(idx)
    run(f"${CELL_FILE}{idx}")
finally:
  cwd = Path(getcwd())
  chdir(cwd.parent.absolute())
  rmtree(cwd.absolute())
  atexit._run_exitfuncs()
`;
}

function toolboxSingleModuleName(fn: BareboneToolboxFunction) {
  return `${TOOLBOX_FILE}_${fn.name}`;
}

export function importedToolboxNames(source: string) {
  try {
    const imports = findImportedNames(source);
    const toolboxImports = imports.filter(
      ({ module }) => module === TOOLBOX_FILE,
    );
    return uniq(toolboxImports.map(({ name }) => name));
  } catch {
    return [];
  }
}

function toposortImports(functions: BareboneToolboxFunction[]) {
  const imports = new Topo.Sorter<string>();
  const deps = functions.map((fn) => ({
    name: fn.name,
    neededNames: importedToolboxNames(fn.source),
  }));
  deps.forEach(({ name, neededNames }) => {
    imports.add(name, { group: name, after: neededNames });
  });
  return imports.nodes.map(
    (name) => functions.find((fn) => fn.name === name) as ToolboxFunction,
  );
}

function toolboxDriverSource(functions: BareboneToolboxFunction[]) {
  let sortedFunctions = functions;
  try {
    sortedFunctions = toposortImports(functions);
  } catch {
    // Possibly a circular import
  }
  return joinLines(
    sortedFunctions.map(
      (fn) => `from ${toolboxSingleModuleName(fn)} import ${fn.name}`,
    ),
  );
}

export function toolboxFiles(
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
    content: toolboxDriverSource(functions),
  };
  return [toolboxMainFile, ...singleFiles];
}

export function cellsToFiles(
  sources: string[],
  idx: number,
  toolboxFunctions: BareboneToolboxFunction[],
  extraPythonFiles: PythonFile[],
): RunPythonFile[] {
  let linesSoFar = 0;
  const sourceRunFiles = sources.map((content, i) => {
    const runFile = {
      name: `${CELL_FILE}${i}.py`,
      // Pad with empty lines to account for the previous cells so that the
      // stack trace still reports the correct line number
      content: emptyLines(linesSoFar) + content,
    };
    linesSoFar += countLines(content);
    return runFile;
  });
  const files = [
    {
      name: `${DRIVER_FILE}.py`,
      content: driverSource(idx + 1),
    },
    ...sourceRunFiles,
    ...toolboxFiles(toolboxFunctions),
    ...extraPythonFiles,
  ];
  // code-runner does not allow empty files, we work around this by including a no-op stmt
  return files.map((file) => ({ ...file, content: file.content || 'pass' }));
}
