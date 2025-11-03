import type { Monaco } from '@monaco-editor/react';
import { editor, type editor as EditorNamespace } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  Workspace,
} from './python-analyzer/python_analyzer';
import { PythonFile } from './schemas/activitySchema';
import { countLines, joinLines } from './sourceUtils';

export type CustomDiagnostic = EditorNamespace.IModelDeltaDecoration & {
  category: ErrorCategory;
  message: string;
};

export const ANALYZER_DIAGNOSTIC_CLASSNAME =
  'squiggly-error analyzer-diagnostic';

function initWorkspace(): Workspace {
  const workspace = new Workspace('/', PositionEncoding.Utf16, {});
  installPytamaro(workspace);
  return workspace;
}

export default function usePythonAnalyzer(
  sources: string[],
  cellIdx: number,
  extraPythonFiles: PythonFile[] = [],
  extraToolboxFunctions: ToolboxFunction[] = [],
) {
  const workspaceRef = useRef<Workspace | null>(null);
  const { list } = useLocalToolbox();
  const toolboxFunctions = list();

  let workspace = workspaceRef.current;
  const [fileHandles, setFileHandles] = useState<Map<string, FileHandle>>(
    new Map<string, FileHandle>(),
  );

  if (workspace === null) {
    workspaceRef.current = workspace = initWorkspace();

    // All cells are joined together
    const initialFiles = cellsToFiles(
      [joinLines(sources)],
      0,
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
    setFileHandles(newFileHandles);
  }

  const getCurrentCellFileHandle = () => {
    if (workspace === null) {
      return undefined;
    }
    return fileHandles.get(`${CURRENT_CELL_FILE}.py`);
  };

  const updateSource = (newSource: string) => {
    const currentCellFileHandle = getCurrentCellFileHandle();
    if (workspace !== null && currentCellFileHandle !== undefined) {
      const fileContent = joinLines(
        sources.map((source, idx) => (idx === cellIdx ? newSource : source)),
      );
      workspace.updateFile(currentCellFileHandle, fileContent);
    }
  };

  const addOrUpdateFile = useCallback(
    (file: PythonFile) => {
      if (workspace !== null) {
        setFileHandles((curHandles) => {
          const handle = curHandles.get(file.name);
          if (handle) {
            workspace.updateFile(handle, file.content);
            return curHandles;
          } else {
            const newFileHandle = workspace.openFile(file.name, file.content);
            return new Map(curHandles).set(file.name, newFileHandle);
          }
        });
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

  const customDiagnostics = (
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

    const linesBefore = sources
      .slice(0, cellIdx)
      .map((source) => countLines(source))
      .reduce((a, b) => a + b, 0);

    const lineCurrent = countLines(editorInstance.getValue());

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
  };

  return {
    addOrUpdateFile,
    updateSource,
    customDiagnostics,
  };
}
