import type { Monaco } from '@monaco-editor/react';
import {
  editor,
  IRange,
  languages,
  Range,
  type editor as EditorNamespace,
} from 'monaco-editor';
import { useCallback, useEffect, useMemo, useRef } from 'react';
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

interface CustomModel extends editor.ITextModel {
  _previousLinesCount: number;
}

export function countPreviousLines(model: editor.ITextModel): number {
  return (model as CustomModel)._previousLinesCount;
}

export function setPreviousLinesCount(
  editorInstance: editor.IStandaloneCodeEditor,
  previousLinesCount: number,
): void {
  const model = editorInstance.getModel() as CustomModel;
  model._previousLinesCount = previousLinesCount;
}

function initWorkspace(): Workspace {
  const workspace = new Workspace('/', PositionEncoding.Utf16, {});
  installPytamaro(workspace);
  return workspace;
}

export type PythonAnalyzer = ReturnType<typeof usePythonAnalyzer>;

export default function usePythonAnalyzer(
  sources: string[],
  extraPythonFiles: PythonFile[] = [],
  extraToolboxFunctions: ToolboxFunction[] = [],
) {
  const workspaceRef = useRef<Workspace | null>(null);
  const { list } = useLocalToolbox();
  const toolboxFunctions = list();

  // A bit of a hack, I am not sure how to do this more cleanly.
  // We need to have an updated references to the sources to figure out the sources
  // of the other cells when calling updateSource().
  // But we would like updateSource to be stable, so that the clients of this hook
  // do not get constant updates.
  const sourcesRef = useRef(sources);
  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  let workspace = workspaceRef.current;
  const fileHandles = useRef<Map<string, FileHandle>>(
    new Map<string, FileHandle>(),
  );

  if (workspace === null) {
    workspaceRef.current = workspace = initWorkspace();

    // All cells are joined together
    const initialFiles = cellsToFiles(
      [joinLines(sources)],
      0, // Pretend that all code is in the first (and only) cell
      [],
      extraPythonFiles,
    );
    const newFileHandles = new Map<string, FileHandle>();
    initialFiles.forEach((file) => {
      const handle = workspace?.openFile(file.name, file.content);
      if (handle) {
        newFileHandles.set(file.name, handle);
      }
    });
    fileHandles.current = newFileHandles;
  }

  const getCurrentCellFileHandle = useCallback(() => {
    if (workspace === null) {
      return undefined;
    }
    return fileHandles.current.get(`${CURRENT_CELL_FILE}.py`);
  }, [workspace, fileHandles]);

  const updateSource = useCallback(
    (cellIdx: number, newSource: string) => {
      const currentCellFileHandle = getCurrentCellFileHandle();
      if (workspace !== null && currentCellFileHandle !== undefined) {
        const fileContent = joinLines(
          sourcesRef.current.map((source, idx) =>
            idx === cellIdx ? newSource : source,
          ),
        );
        workspace.updateFile(currentCellFileHandle, fileContent);
      }
    },
    [workspace, getCurrentCellFileHandle],
  );

  const addOrUpdateFile = useCallback(
    (file: PythonFile) => {
      if (workspace !== null) {
        const handle = fileHandles.current.get(file.name);
        if (handle) {
          workspace.updateFile(handle, file.content);
        } else {
          const newFileHandle = workspace.openFile(file.name, file.content);
          fileHandles.current.set(file.name, newFileHandle);
        }
      }
    },
    [workspace],
  );

  const allToolboxFunctions = [...toolboxFunctions, ...extraToolboxFunctions];
  const allToolboxFunctionsStatus = JSON.stringify(allToolboxFunctions);

  useEffect(() => {
    if (workspace) {
      for (const file of toolboxFiles(allToolboxFunctions)) {
        addOrUpdateFile(file);
      }
    }
    // allToolboxFunctionsStatus for deep comparison of the toolbox functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allToolboxFunctionsStatus, workspace, addOrUpdateFile]);

  const customDiagnostics = useCallback(
    (
      monacoInstance: Monaco,
      editorInstance: editor.IStandaloneCodeEditor,
    ): CustomDiagnostic[] => {
      const currentCellFileHandle = getCurrentCellFileHandle();
      if (workspace === null || currentCellFileHandle === undefined) {
        return [];
      }
      const diagnostics = workspace.checkFile(currentCellFileHandle);
      // Eagerly convert the diagnostic to avoid out of bound errors
      // when the diagnostics are "deferred".
      const serializedDiagnostics = diagnostics.map((diagnostic) => ({
        id: diagnostic.id(),
        message: diagnostic.message(),
        //severity: diagnostic.severity(),
        range: diagnostic.toRange(workspace) ?? null,
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
    },
    [getCurrentCellFileHandle, workspace],
  );

  function tyRangeToMonacoRange(
    range: TyRange,
    previousLinesCount: number,
  ): IRange {
    return {
      startLineNumber: range.start.line - previousLinesCount,
      startColumn: range.start.column,
      endLineNumber: range.end.line - previousLinesCount,
      endColumn: range.end.column,
    };
  }

  function monacoRangeToTyRange(
    range: IRange,
    previousLinesCount: number,
  ): TyRange {
    const actualStartLineNumber = range.startLineNumber + previousLinesCount;
    const actualEndLineNumber = range.endLineNumber + previousLinesCount;
    return new TyRange(
      new TyPosition(actualStartLineNumber, range.startColumn),
      new TyPosition(actualEndLineNumber, range.endColumn),
    );
  }

  const generateMonacoTokens = useCallback(
    (
      semantic: SemanticToken[],
      model: editor.ITextModel,
      previousLinesCount: number,
    ): languages.SemanticTokens => {
      const result = [];

      let prevLine = 0;
      let prevChar = 0;

      for (const token of semantic) {
        // Convert from 1-based to 0-based indexing for Monaco
        const line = token.range.start.line - 1;
        const char = token.range.start.column - 1;

        const length = model.getValueLengthInRange(
          tyRangeToMonacoRange(token.range, previousLinesCount),
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
    },
    [],
  );

  const documentRangeSemanticTokens = useCallback(
    (
      model: editor.ITextModel,
      range: Range,
    ): languages.SemanticTokens | null => {
      const fileHandle = getCurrentCellFileHandle();
      if (!fileHandle) {
        return null;
      }
      const previousLinesCount = countPreviousLines(model);
      const tyRange = monacoRangeToTyRange(range, previousLinesCount);
      const tokens = workspace.semanticTokensInRange(fileHandle, tyRange);
      return generateMonacoTokens(tokens, model, previousLinesCount);
    },
    [getCurrentCellFileHandle, workspace, generateMonacoTokens],
  );

  const semanticTokensLegend =
    useCallback((): languages.SemanticTokensLegend => {
      return {
        tokenTypes: SemanticToken.kinds(),
        tokenModifiers: SemanticToken.modifiers(),
      };
    }, []);

  return useMemo(() => {
    return {
      addOrUpdateFile,
      updateSource,
      customDiagnostics,
      documentRangeSemanticTokens,
      semanticTokensLegend,
    };
  }, [
    addOrUpdateFile,
    updateSource,
    customDiagnostics,
    documentRangeSemanticTokens,
    semanticTokensLegend,
  ]);
}
