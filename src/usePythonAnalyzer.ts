import type { Monaco } from '@monaco-editor/react';
import {
  editor,
  IRange,
  languages,
  Range,
  type editor as EditorNamespace,
} from 'monaco-editor';
import { useEffect, useRef } from 'react';
import {
  ErrorCategory,
  staticErrorMessageCategory,
} from '../components/editor/errors';
import { cellsToFiles, CURRENT_CELL_FILE, toolboxFiles } from './codeExecution';
import { ToolboxFunction } from './localStorage/schema';
import useLocalToolbox from './localStorage/useLocalToolbox';
import {
  FileHandle,
  installPytamaro,
  PositionEncoding,
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

export class PythonAnalyzer {
  private workspace: Workspace;
  private fileHandles: Map<string, FileHandle>;
  private sources: string[];

  constructor(extraPythonFiles: PythonFile[] = []) {
    this.workspace = new Workspace('/', PositionEncoding.Utf16, {});
    installPytamaro(this.workspace);
    this.fileHandles = new Map<string, FileHandle>();
    this.sources = [];

    // All cells are joined together in a virtual single cell.
    const initialFiles = cellsToFiles(
      [joinLines(this.sources)],
      0,
      [],
      extraPythonFiles,
    );
    initialFiles.forEach((file) => {
      const handle = this.workspace?.openFile(file.name, file.content);
      if (handle) {
        this.fileHandles.set(file.name, handle);
      }
    });
  }

  getCurrentCellFileHandle(): FileHandle | undefined {
    return this.fileHandles.get(`${CURRENT_CELL_FILE}.py`);
  }

  updateSource(cellIdx: number, newSource: string) {
    const currentCellFileHandle = this.getCurrentCellFileHandle();
    if (currentCellFileHandle !== undefined) {
      this.sources[cellIdx] = newSource;
      const fileContent = joinLines(this.sources);
      this.workspace.updateFile(currentCellFileHandle, fileContent);
    }
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
    const fileHandle = this.getCurrentCellFileHandle();
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

  customDiagnostics(
    monacoInstance: Monaco,
    editorInstance: editor.IStandaloneCodeEditor,
  ): CustomDiagnostic[] {
    const currentCellFileHandle = this.getCurrentCellFileHandle();
    if (currentCellFileHandle === undefined) {
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

    const model = editorInstance.getModel();
    if (model === null) {
      return [];
    }

    const linesBefore = countPreviousLines(model);
    const lineCurrent = model.getLineCount();

    // Only keep the markers for the current cell
    const currentCellMarkers = decorations.filter(
      (marker) =>
        marker.range.startLineNumber > linesBefore &&
        marker.range.endLineNumber <= linesBefore + lineCurrent,
    );

    // Subtract the number of lines before the current cell
    // to get the correct line number in the editor
    return currentCellMarkers.map((marker) => ({
      ...marker,
      range: new monacoInstance.Range(
        marker.range.startLineNumber - linesBefore,
        marker.range.startColumn,
        marker.range.endLineNumber - linesBefore,
        marker.range.endColumn,
      ),
    }));
  }
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

interface CustomModel extends editor.ITextModel {
  _previousLinesCount: number;
  _pythonAnalyzer: PythonAnalyzer;
}

export function countPreviousLines(model: editor.ITextModel): number {
  return (model as CustomModel)._previousLinesCount;
}

export function storePreviousLinesCount(
  editorInstance: editor.IStandaloneCodeEditor,
  previousLinesCount: number,
): void {
  const model = editorInstance.getModel() as CustomModel;
  model._previousLinesCount = previousLinesCount;
}

export function storePythonAnalyzer(
  editorInstance: editor.IStandaloneCodeEditor,
  pythonAnalyzer: PythonAnalyzer,
): void {
  const model = editorInstance.getModel() as CustomModel;
  model._pythonAnalyzer = pythonAnalyzer;
}

export function retrievePythonAnalyzer(
  model: editor.ITextModel,
): PythonAnalyzer {
  const customModel = model as CustomModel;
  return customModel._pythonAnalyzer;
}
