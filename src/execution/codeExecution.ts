import Topo from '@hapi/topo';
import lodash from 'lodash';
import { ToolboxFunction } from '../localStorage/schema';
import { findImportedNames } from '../python-analyzer/python_analyzer';
import { countLines, emptyLines, joinLines } from '../sourceUtils';
import { RunPythonFile, WorkspaceChanges } from './messageTypes';

const { uniq } = lodash;

export type ExecutionResponse = (
  | NominalExecutionResponse
  | FailedExecutionResponse
) & {
  /** Files of the IDE workspace created, modified, or deleted by the run. */
  workspaceChanges?: WorkspaceChanges;
};

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

export enum PythonMode {
  Exec = 'exec',
  EvalLastExpr = 'eval-last-expr',
}

/**
 * !!! IMPORTANT !!!
 * Update this version at every change to the process below
 * that turns cells into files for execution.
 */
export const CODE_EXECUTION_CELLS_TO_FILES_VERSION = 11;

export function cellFileName(idx: number) {
  return `${CELL_FILE}${idx}.py`;
}

export const DRIVER_FILE = 'driver';
export const CELL_FILE = 'cell_';
export const TOOLBOX_FILE = 'toolbox';

export interface BareboneToolboxFunction {
  name: string;
  source: string;
}

function driverSource(cellFileNames: string[], pythonMode: PythonMode) {
  // IMPORTANT, part 1:
  // the entire driver is wrapped in a single function so that `globals_dict`,
  // which contains the shared state between cells,
  // goes clearly out of scope at the end of the execution of the wrapper,
  // allowing the GC to properly clean it up at the end of the execution of all
  // cells.

  // IMPORTANT, part 2:
  // linecache is necessary to improve the traceback (e.g., to show the source
  // code, and possibly also the caret). The hack is taken from:
  // https://github.com/pyodide/pyodide/blob/3f80192aa814a17dfee7eb20bb24da6509c22049/src/py/_pyodide/_base.py#L312

  // IMPORTANT, part 3:
  // When PythonMode is EvalLastExpr,
  // extracting the last expression fails when the source cannot be parsed.
  // However, we don't want to surface the exception from the ast.parse() call,
  // because it breaks some assumptions we make when processing the traceback.
  // When an exception occurs, the driver falls back to executing with `exec()`.
  return `
from pathlib import Path
from pytamaro_js_ffi import set_active_cell
from sys import stderr, stdout
import atexit
import ast
import linecache
import pytamaro

def normal_exec(source_or_tree, filename, globals_dict):
    exec(compile(source_or_tree, filename, "exec"), globals_dict)

def extract_last_expr(source):
    try:
        tree = ast.parse(source)
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            return ast.Module(body=tree.body[:-1]), ast.Expression(body=tree.body[-1].value)
    except:
      pass
    return None, None
  
def print_eval_result(result):
    if result is None:
        return
    print("@@@EVAL_RESULT_BEGIN@@@", end="")
    if isinstance(result, pytamaro.Graphic):
        pytamaro.show_graphic(result)
    else:
        print(repr(result), end="")
    print("@@@EVAL_RESULT_END@@@", end="")

def main():
  try:
    globals_dict = {}
    for path in Path(".").rglob("*.py"):
        try:
            text = path.read_text()
        except (OSError, ValueError):
            # Not a text file (e.g., a binary file that happens to be named
            # *.py): it can't be exec'd, so there is nothing to cache for it.
            continue
        entry = [lambda text=text: text]
        # Traceback frames use the name the code was compiled with: the relative
        # path for the files we exec (e.g., "main.py"), and the absolute path for
        # imported modules. Register both, otherwise frames of exec'd files miss
        # the cache (and, by the time the traceback is printed, the files are gone).
        linecache.cache[str(path)] = entry
        linecache.cache[str(path.resolve())] = entry
    def run_single_cell(filename):
        source = Path(filename).read_text()
        if ${pythonMode === 'eval-last-expr' ? 'True' : 'False'}:
            stmts, last_expr = extract_last_expr(source)
            if last_expr is not None:
                normal_exec(stmts, filename, globals_dict)
                result = eval(compile(last_expr, filename, "eval"), globals_dict)
                print_eval_result(result)
            else:
                normal_exec(source, filename, globals_dict)
        else:
            normal_exec(source, filename, globals_dict)

    for idx, filename in enumerate(${JSON.stringify(cellFileNames)}):
      set_active_cell(idx)
      run_single_cell(filename)
      if stdout is not None:
        stdout.flush()
      if stderr is not None:
        stderr.flush()
  finally:
    # Run exit handlers while the working directory (and the files the script
    # created) still exist. The worker snapshots the directory afterwards.
    atexit._run_exitfuncs()
main()
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
  extraPythonFiles: RunPythonFile[],
  pythonMode: PythonMode,
  fileNames: string[] = [],
): RunPythonFile[] {
  const nameOf = (i: number) => fileNames[i] ?? cellFileName(i);
  let linesSoFar = 0;
  const sourceRunFiles = sources.map((content, i) => {
    const runFile = {
      name: nameOf(i),
      // Pad with empty lines to account for the previous cells so that the
      // stack trace still reports the correct line number
      content: emptyLines(linesSoFar) + content,
    };
    linesSoFar += countLines(content);
    return runFile;
  });
  return [
    {
      name: `${DRIVER_FILE}.py`,
      content: driverSource(
        Array.from({ length: idx + 1 }, (_, i) => nameOf(i)),
        pythonMode,
      ),
    },
    ...sourceRunFiles,
    ...toolboxFiles(toolboxFunctions),
    ...extraPythonFiles,
  ];
}
