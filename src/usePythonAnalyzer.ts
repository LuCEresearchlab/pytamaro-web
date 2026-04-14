/* eslint-disable no-param-reassign */
import type { Monaco } from '@monaco-editor/react';
import {
  editor,
  IRange,
  languages,
  Position,
  Range,
  type editor as EditorNamespace,
} from 'monaco-editor';
import { useEffect, useRef } from 'react';
import {
  ErrorCategory,
  staticErrorMessageCategory,
} from '../components/editor/errors';
import { CELL_FILE, toolboxFiles } from './execution/codeExecution';
import { LiveAnalysisStatus, ToolboxFunction } from './localStorage/schema';
import useLocalToolbox from './localStorage/useLocalToolbox';
import {
  AnalysisResult,
  analyzeFile,
  FileHandle,
  initWorkspace,
  PythonFunction,
  PythonName,
  SemanticToken,
  Position as TyPosition,
  Range as TyRange,
  Workspace,
} from './python-analyzer/python_analyzer';
import { PythonFile } from './schemas/activitySchema';
import { joinLines } from './sourceUtils';

export type CustomDiagnostic = EditorNamespace.IModelDeltaDecoration & {
  category: ErrorCategory;
  message: string;
};

export const ANALYZER_DIAGNOSTIC_CLASSNAME =
  'squiggly-error analyzer-diagnostic';

export type FilesAnalysisResult = {
  name: string;
  analysisResult: AnalysisResult;
}[];

export class PythonAnalyzer {
  private workspace: Workspace;
  private fileHandles: Map<string, FileHandle>;
  private sources: string[];
  private diagnosticsCounts: number[];
  private analysisResults: AnalysisResult[];
  private newAnalysisResultsListeners: (() => void)[][] = [];

  constructor(extraPythonFiles: PythonFile[] = []) {
    this.workspace = initWorkspace();
    this.fileHandles = new Map<string, FileHandle>();
    this.sources = [];
    this.diagnosticsCounts = [];
    this.analysisResults = [];
    this.newAnalysisResultsListeners = [];
    extraPythonFiles.forEach((file) => {
      const handle = this.workspace?.openFile(file.name, file.content);
      if (handle) {
        this.fileHandles.set(file.name, handle);
      }
    });
  }

  currentCellFileName(cellIdx: number): string {
    return `${CELL_FILE}${cellIdx}.py`;
  }

  getCurrentCellFileHandle(cellIdx: number): FileHandle | undefined {
    return this.fileHandles.get(this.currentCellFileName(cellIdx));
  }

  updateSource(cellIdx: number, newSource: string) {
    this.sources[cellIdx] = newSource;
    const fileContent = joinLines(this.sources.slice(0, cellIdx + 1));
    this.addOrUpdateFile({
      name: this.currentCellFileName(cellIdx),
      content: fileContent,
    });
    this.analyze(cellIdx);
  }

  private notifyNewAnalysisResults(cellIdx: number) {
    this.newAnalysisResultsListeners[cellIdx]?.forEach((callback) => {
      callback();
    });
  }

  addNewAnalysisResultListener(cellIdx: number, handler: () => void) {
    if (!this.newAnalysisResultsListeners[cellIdx]) {
      this.newAnalysisResultsListeners[cellIdx] = [];
    }
    this.newAnalysisResultsListeners[cellIdx].push(handler);
  }

  removeNewAnalysisResultListener(cellIdx: number, handler: () => void) {
    this.newAnalysisResultsListeners[cellIdx].forEach((h, index) => {
      if (h === handler) {
        this.newAnalysisResultsListeners[cellIdx].splice(index, 1);
      }
    });
  }

  addOrUpdateFile(file: PythonFile) {
    const handle = this.fileHandles.get(file.name);
    if (handle) {
      this.workspace.updateFile(handle, file.content);
    } else {
      const newFileHandle = this.workspace.openFile(file.name, file.content);
      this.fileHandles.set(file.name, newFileHandle);
    }
  }

  tyRangeToMonacoRange(range: TyRange, previousLinesCount: number): IRange {
    return {
      startLineNumber: range.start.line - previousLinesCount,
      startColumn: range.start.column,
      endLineNumber: range.end.line - previousLinesCount,
      endColumn: range.end.column,
    };
  }

  monacoRangeToTyRange(range: IRange, previousLinesCount: number): TyRange {
    const actualStartLineNumber = range.startLineNumber + previousLinesCount;
    const actualEndLineNumber = range.endLineNumber + previousLinesCount;
    return new TyRange(
      new TyPosition(actualStartLineNumber, range.startColumn),
      new TyPosition(actualEndLineNumber, range.endColumn),
    );
  }

  generateMonacoTokens(
    semantic: SemanticToken[],
    model: editor.ITextModel,
    previousLinesCount: number,
  ): languages.SemanticTokens {
    const result = [];

    let prevLine = 0;
    let prevChar = 0;

    for (const token of semantic) {
      // Convert from 1-based to 0-based indexing for Monaco
      const line = token.range.start.line - 1;
      const char = token.range.start.column - 1;

      const length = model.getValueLengthInRange(
        this.tyRangeToMonacoRange(token.range, previousLinesCount),
      );

      result.push(
        line - prevLine,
        prevLine === line ? char - prevChar : char,
        length,
        token.kind,
        token.modifiers,
      );

      prevLine = line;
      prevChar = char;
    }

    if (result.length > 0) {
      // Adjust the line number to account for previous lines.
      // Note that result[5*ith_token] is the line *difference* for the ith token,
      // so we must adjust only the first token (the only "absolute" one)
      // to correctly position all the tokens.
      result[0] -= previousLinesCount;
    }

    return { data: Uint32Array.from(result) };
  }

  documentRangeSemanticTokens(
    model: editor.ITextModel,
    range: Range,
  ): languages.SemanticTokens | null {
    const fileHandle = this.getCurrentCellFileHandle(retrieveCellIdx(model));
    if (!fileHandle) {
      return null;
    }
    const previousLinesCount = countPreviousLines(model);
    const tyRange = this.monacoRangeToTyRange(range, previousLinesCount);
    const tokens = this.workspace.semanticTokensInRange(fileHandle, tyRange);
    return this.generateMonacoTokens(tokens, model, previousLinesCount);
  }

  semanticTokensLegend(): languages.SemanticTokensLegend {
    return {
      tokenTypes: SemanticToken.kinds(),
      tokenModifiers: SemanticToken.modifiers(),
    };
  }

  private computePreviousCellsLength(cellIdx: number): number {
    return joinLines(this.sources.slice(0, cellIdx)).length;
  }

  private analyze(cellIdx: number) {
    const fileHandle = this.getCurrentCellFileHandle(cellIdx);
    if (!fileHandle) {
      throw new Error(
        `Could not analyze cell ${cellIdx}: no file handle found`,
      );
    }
    const analysisResult = analyzeFile(this.workspace, fileHandle);
    // We're only interested in ellipsis and names called in the current cell:
    // filter out the ones from previous cells.
    // `.start` is a zero-based offset in the whole file.
    const previousCellsLength = this.computePreviousCellsLength(cellIdx);
    analysisResult.ellipsis = analysisResult.ellipsis.filter(
      (start) => start >= previousCellsLength,
    );
    analysisResult.called_names = analysisResult.called_names.filter(
      (called_name) => called_name.start >= previousCellsLength,
    );
    // We also need to adjust the ranges
    analysisResult.import_ranges.forEach((range) => {
      range.start -= previousCellsLength;
      range.end -= previousCellsLength;
    });
    this.analysisResults[cellIdx] = analysisResult;
    this.notifyNewAnalysisResults(cellIdx);
  }

  getAnalysisResult(cellIdx: number): AnalysisResult | undefined {
    return this.analysisResults[cellIdx];
  }

  functionsDefinedInCell(cellIdx: number): PythonFunction[] {
    const analysisResult = this.getAnalysisResult(cellIdx);
    if (!analysisResult) {
      return [];
    }
    const previousCellsLength = this.computePreviousCellsLength(cellIdx);
    return analysisResult.defined_functions.filter(
      (fn) => fn.start >= previousCellsLength,
    );
  }

  analyzeExtraPythonFile(file: PythonFile): AnalysisResult {
    const fileHandle = this.fileHandles.get(file.name);
    if (!fileHandle) {
      throw new Error(
        `Could not analyze extra Python file ${file.name}: no file handle found`,
      );
    }
    return analyzeFile(this.workspace, fileHandle);
  }

  customDiagnostics(
    monacoInstance: Monaco,
    cellIdx: number,
    liveAnalysis: LiveAnalysisStatus,
  ): CustomDiagnostic[] {
    const currentCellFileHandle = this.getCurrentCellFileHandle(cellIdx);
    if (
      currentCellFileHandle === undefined ||
      liveAnalysis === LiveAnalysisStatus.None
    ) {
      this.diagnosticsCounts[cellIdx] = 0;
      return [];
    }
    const diagnostics = this.workspace.checkFile(currentCellFileHandle);

    // Eagerly convert the diagnostic to avoid out of bound errors
    // when the diagnostics are "deferred".
    const serializedDiagnostics = diagnostics.map((diagnostic) => ({
      id: diagnostic.id(),
      message: diagnostic.message(),
      //severity: diagnostic.severity(),
      range: diagnostic.toRange(this.workspace) ?? null,
      //textRange: diagnostic.textRange() ?? null,
    }));

    const decorations = serializedDiagnostics.map((diagnostic) => {
      const range = diagnostic.range;

      return {
        range: new monacoInstance.Range(
          range?.start.line ?? 0,
          range?.start.column ?? 0,
          range?.end.line ?? 0,
          range?.end.column ?? 0,
        ),
        options: {
          className: ANALYZER_DIAGNOSTIC_CLASSNAME,
          showIfCollapsed: true,
        },
        message: diagnostic.message,
        category: staticErrorMessageCategory(diagnostic.id),
      };
    });
    const visibleDecorations = decorations.filter(
      (diag) =>
        diag.category === ErrorCategory.SyntaxError ||
        liveAnalysis === LiveAnalysisStatus.SyntaxSemantics,
    );
    // Update counts for all cells
    const previousCountThisCell = this.diagnosticsCounts[cellIdx] || 0;
    this.diagnosticsCounts[cellIdx] = visibleDecorations.length;
    const delta = this.diagnosticsCounts[cellIdx] - previousCountThisCell;
    for (let i = cellIdx + 1; i < this.diagnosticsCounts.length; i++) {
      this.diagnosticsCounts[i] += delta;
    }

    return visibleDecorations;
  }

  getDiagnosticsCountUpTo(cellIdx: number): number {
    return this.diagnosticsCounts[cellIdx] || 0;
  }

  getSourcesUpTo(cellIdx: number): string[] {
    return this.sources.slice(0, cellIdx + 1);
  }

  hoveredPythonName(
    model: editor.ITextModel,
    position: Position,
  ): PythonName | null {
    const name = model.getWordAtPosition(position)?.word;
    if (!name) {
      return null;
    }
    const fileHandle = this.getCurrentCellFileHandle(retrieveCellIdx(model));
    if (!fileHandle) {
      return null;
    }
    const previousLinesCount = countPreviousLines(model);
    const tyPosition = new TyPosition(
      position.lineNumber + previousLinesCount,
      position.column,
    );
    const locations = this.workspace.gotoDeclaration(fileHandle, tyPosition);
    if (locations.length === 0) {
      return null;
    } else {
      // In case of multiple declarations, pick the first one (they are listed from the innermost scope to the outermost).
      const path = locations[0].path;
      const mod = path === fileHandle.path() ? '.' : moduleFromPath(path);
      return new PythonName(mod, name);
    }
  }
}

function moduleFromPath(path: string): string {
  // Standard library 'vendored://stdlib/math.pyi' --> 'math'
  // (but ignores __init__, so that 'vendored://stdlib/string/__init__.pyi' --> 'string')
  const vendoredLibRegex = /^vendored:\/\/stdlib\/(.+?)(?:\/__init__)?\.pyi$/;
  const match = path.match(vendoredLibRegex);
  if (match) {
    return match[1];
  }
  // PyTamaro '/pytamaro/any/some_module.py' --> 'pytamaro', but '/pytamaro/it/some_module.py' --> 'pytamaro.it'
  const matchPyTamaro = path.match(/^\/pytamaro\//);
  if (matchPyTamaro) {
    // but preserve pytamaro.it, pytamaro.de, pytamaro.fr
    const localizedPyTamaro = path.match(/^\/pytamaro\/(it|de|fr)\//);
    if (localizedPyTamaro) {
      return `pytamaro.${localizedPyTamaro[1]}`;
    }
    return 'pytamaro';
  }
  return path.slice(1).replace('.py', '');
}

export default function usePythonAnalyzer(
  extraPythonFiles: PythonFile[] = [],
  extraToolboxFunctions: ToolboxFunction[] = [],
) {
  const pythonAnalyzerRef = useRef<PythonAnalyzer | null>(null);
  let pythonAnalyzer = pythonAnalyzerRef.current;

  if (pythonAnalyzerRef.current === null) {
    pythonAnalyzerRef.current = pythonAnalyzer = new PythonAnalyzer(
      extraPythonFiles,
    );
  }

  // Effect to update the toolbox files in the analyzer, whenever the toolbox changes.
  const { list } = useLocalToolbox();
  const toolboxFunctions = list();
  const allToolboxFunctions = [...toolboxFunctions, ...extraToolboxFunctions];
  const allToolboxFunctionsStatus = JSON.stringify(allToolboxFunctions);

  useEffect(() => {
    for (const file of toolboxFiles(allToolboxFunctions)) {
      pythonAnalyzerRef.current?.addOrUpdateFile(file);
    }
    // allToolboxFunctionsStatus for deep comparison of the toolbox functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allToolboxFunctionsStatus, pythonAnalyzer]);

  return pythonAnalyzer;
}

/* ---------------------------------------------------------
   Hack to store custom properties in the Monaco Editor models,
   so that they can be retrieved later (e.g., by the semantic tokens provider,
   which only receives the model as argument).
*/

interface CustomModel extends editor.ITextModel {
  _cellIdx: number;
  _previousLinesCount: number;
  _pythonAnalyzer: PythonAnalyzer;
}

function storeCustomPropertyInModel<T>(
  editorInstance: editor.IStandaloneCodeEditor,
  propertyName: string,
  value: T,
): void {
  const model = editorInstance.getModel() as CustomModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (model as any)[propertyName] = value;
}

function retrieveCustomPropertyFromModel<T>(
  model: editor.ITextModel,
  propertyName: string,
): T {
  const customModel = model as CustomModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (customModel as any)[propertyName] as T;
}

export function storeCellIdx(
  editorInstance: editor.IStandaloneCodeEditor,
  cellIdx: number,
): void {
  storeCustomPropertyInModel(editorInstance, '_cellIdx', cellIdx);
}

export function retrieveCellIdx(model: editor.ITextModel): number {
  return retrieveCustomPropertyFromModel<number>(model, '_cellIdx');
}

export function countPreviousLines(model: editor.ITextModel): number {
  return retrieveCustomPropertyFromModel<number>(model, '_previousLinesCount');
}

export function storePreviousLinesCount(
  editorInstance: editor.IStandaloneCodeEditor,
  previousLinesCount: number,
): void {
  storeCustomPropertyInModel(
    editorInstance,
    '_previousLinesCount',
    previousLinesCount,
  );
}

export function storePythonAnalyzer(
  editorInstance: editor.IStandaloneCodeEditor,
  pythonAnalyzer: PythonAnalyzer,
): void {
  storeCustomPropertyInModel(editorInstance, '_pythonAnalyzer', pythonAnalyzer);
}

export function retrievePythonAnalyzer(
  model: editor.ITextModel,
): PythonAnalyzer {
  return retrieveCustomPropertyFromModel<PythonAnalyzer>(
    model,
    '_pythonAnalyzer',
  );
}
