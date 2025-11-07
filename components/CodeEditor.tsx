import Editor, { Monaco } from '@monaco-editor/react';
import { throttle } from 'lodash';
import { editor, type editor as EditorNamespace } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExecutionResponse } from '../src/codeExecution';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import {
  moduleImportCompletionProvider,
  pytamaroImportCompletionProvider,
  toolboxImportCompletionProvider,
} from '../src/monacoSuggestions';
import { addErrorAnnotationsFromExecution } from '../src/pythonTraceback';
import scrollToAnchor from '../src/scrollToAnchor';
import theme from '../src/theme';
import {
  CustomDiagnostic,
  PythonAnalyzer,
  setPreviousLinesCount,
} from '../src/usePythonAnalyzer';
import { ErrorMessageWidget } from './editor/ErrorMessageWidget';
import { ErrorCategory } from './editor/errors';
import {
  registerCustomPythonLanguage,
  STRICT_PYTHON3_LANG_ID,
} from './editor/strictPython3';
import {
  colorizeElements,
  configureEditor,
  luceTheme,
  luceThemeName,
  RUN_CODE_CONDITION_KEY,
} from './editor/utils';

configureEditor();

type MonacoForPyTamaro = Monaco & {
  customProvidersRegistered?: boolean;
  pytamaroColorized?: boolean;
};

export default function CodeEditor({
  initialSource,
  currentSource,
  executionResponse = undefined,
  onChange = () => {},
  onExecutionRequested = undefined,
  executionAllowed = false,
  executionFinished = false,
  firstLineNumber = 1,
  readOnly = false,
  resetCounter = 0,
  pythonAnalyzer,
  cellIdx,
}: {
  initialSource: string;
  currentSource: string;
  executionResponse?: ExecutionResponse;
  onChange?: (source: string) => void;
  onExecutionRequested?: () => void;
  executionAllowed?: boolean;
  executionFinished?: boolean;
  firstLineNumber?: number;
  readOnly?: boolean;
  resetCounter?: number;
  pythonAnalyzer: PythonAnalyzer;
  cellIdx: number;
}) {
  const { list } = useLocalToolbox();
  const { metadata } = useLocalProfile();
  const { semanticChecksEnabled } = metadata;

  const monacoRef = useRef<MonacoForPyTamaro | null>(null);
  const editorRef = useRef<EditorNamespace.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  let monacoInstance = monacoRef.current;
  let editorInstance = editorRef.current;
  const [executionAllowedCondition, setExecutionAllowedCondition] =
    useState<EditorNamespace.IContextKey<boolean> | null>(null);
  const toolboxFunctions = list();
  const runtimeErrorWidgetRef = useRef<ErrorMessageWidget | null>(null);
  const staticErrorWidgetRef = useRef<ErrorMessageWidget | null>(null);
  const decorationsCollectionRef = useRef<
    editor.IEditorDecorationsCollection[]
  >([]);
  const hoveredStaticErrorDecorationRef =
    useRef<editor.IEditorDecorationsCollection>(null);
  const customDiagnosticsRef = useRef<CustomDiagnostic[]>([]);

  const handleEditorMount = (
    editor: EditorNamespace.IStandaloneCodeEditor,
    monaco: MonacoForPyTamaro,
  ) => {
    monacoRef.current = monacoInstance = monaco;
    editorRef.current = editorInstance = editor;

    registerCustomPythonLanguage(monaco);

    monaco.editor.defineTheme(luceThemeName, luceTheme);
    monaco.editor.setTheme(luceThemeName);

    setExecutionAllowedCondition(
      editor.createContextKey(RUN_CODE_CONDITION_KEY, executionAllowed),
    );

    let firstHeightUpdate = true;
    const updateHeight = (event: EditorNamespace.IContentSizeChangedEvent) => {
      if (event.contentHeightChanged) {
        if (containerRef.current !== null) {
          containerRef.current.style.height = `${event.contentHeight}px`;
        }
        editor.layout({
          width: editor.getLayoutInfo().width,
          height: event.contentHeight,
        });
        if (firstHeightUpdate) {
          // After the editor has been loaded and its height has been updated for the first time,
          // (re-)scroll the anchor element into view.
          firstHeightUpdate = false;
          scrollToAnchor();
        }
      }
    };
    editor.onDidContentSizeChange(updateHeight);
    // Manually trigger the first height update.
    updateHeight({
      contentHeight: editor.getContentHeight(),
      contentHeightChanged: true,
      contentWidth: editor.getContentWidth(),
      contentWidthChanged: true,
    });

    if (monaco.pytamaroColorized === undefined) {
      colorizeElements(monaco);
      // eslint-disable-next-line no-param-reassign
      monaco.pytamaroColorized = true;
    }
  };

  const clearStaticAnnotations = () => {
    staticErrorWidgetRef.current?.dispose();
    staticErrorWidgetRef.current = null;
    hoveredStaticErrorDecorationRef.current?.clear();
    hoveredStaticErrorDecorationRef.current = null;
  };

  const clearAnnotations = useCallback(() => {
    if (monacoInstance && editorInstance) {
      // Remove possible widgets
      runtimeErrorWidgetRef.current?.dispose();
      runtimeErrorWidgetRef.current = null;
      // Remove possible collections of decorations
      decorationsCollectionRef.current.forEach((collection) => {
        collection.clear();
      });
      decorationsCollectionRef.current = [];
      // Remove static error annotations
      clearStaticAnnotations();
    }
  }, [monacoInstance, editorInstance]);

  // Effect to update the previous lines count stored inside the model (to be used, e.g., by the semantic tokens provider).
  useEffect(() => {
    if (editorInstance) {
      setPreviousLinesCount(editorInstance, firstLineNumber - 1);
    }
  }, [firstLineNumber, editorInstance]);

  // Effect to update the condition that determines whether the code execution is allowed or not.
  useEffect(() => {
    if (executionAllowedCondition) {
      executionAllowedCondition.set(executionAllowed);
    }
  }, [executionAllowed, executionAllowedCondition]);

  // Effect to register the action that triggers the code execution.
  useEffect(() => {
    if (monacoInstance && editorInstance && onExecutionRequested) {
      const actionDisposer = editorInstance.addAction({
        id: 'code-execution',
        label: 'Run Code Cell',
        keybindings: [
          // eslint-disable-next-line no-bitwise
          monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
        ],
        precondition: RUN_CODE_CONDITION_KEY,
        contextMenuGroupId: 'navigation',
        run() {
          onExecutionRequested();
        },
      });
      return () => {
        actionDisposer.dispose();
      };
    }
    return () => {};
  }, [editorInstance, monacoInstance, onExecutionRequested]);

  // Effect to register various providers (e.g, completion, semantic tokens).
  useEffect(() => {
    if (monacoInstance && !monacoInstance.customProvidersRegistered) {
      const providers = [
        toolboxImportCompletionProvider(monacoInstance, toolboxFunctions),
        moduleImportCompletionProvider(monacoInstance),
        pytamaroImportCompletionProvider(monacoInstance),
      ];
      const disposers = providers.map((provider) =>
        monacoInstance?.languages.registerCompletionItemProvider(
          STRICT_PYTHON3_LANG_ID,
          provider,
        ),
      );
      disposers.push(
        monacoInstance.languages.registerDocumentRangeSemanticTokensProvider(
          STRICT_PYTHON3_LANG_ID,
          {
            provideDocumentRangeSemanticTokens:
              pythonAnalyzer.documentRangeSemanticTokens,
            getLegend: pythonAnalyzer.semanticTokensLegend,
          },
        ),
      );
      // eslint-disable-next-line no-param-reassign
      monacoInstance.customProvidersRegistered = true;
      return () => {
        disposers.forEach((disposer) => disposer?.dispose());
        if (monacoInstance) monacoInstance.customProvidersRegistered = false;
      };
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoInstance, toolboxFunctions, firstLineNumber]);

  useEffect(() => {
    const handleMouseMoved = (e: EditorNamespace.IEditorMouseEvent) => {
      if (runtimeErrorWidgetRef.current) {
        // If there is a runtime error widget shown, do not show static error widgets.
        return;
      }
      clearStaticAnnotations();
      // Find position under mouse
      // Check if there is a diagnostic at that position
      const position = e.target.position;
      if (!position) {
        return;
      }
      const matchingDiagnostics = customDiagnosticsRef.current.filter((diag) =>
        monacoInstance?.Range.containsPosition(diag.range, position),
      );
      if (matchingDiagnostics.length > 0) {
        const diag = matchingDiagnostics[0];
        const widget = new ErrorMessageWidget(
          monacoInstance!,
          editorInstance!,
          diag.range,
          diag.message,
          false,
          diag.category,
        );
        hoveredStaticErrorDecorationRef.current =
          editorInstance!.createDecorationsCollection([
            {
              range: diag.range,
              options: {
                className: 'analyzer-diagnostic-code-highlight',
                showIfCollapsed: true,
              },
            },
          ]);
        staticErrorWidgetRef.current = widget;
      }
    };
    editorInstance?.onMouseMove(
      throttle((e) => {
        handleMouseMoved(e);
      }, 200),
    );
    editorInstance?.onMouseLeave(
      throttle(() => {
        clearStaticAnnotations();
      }, 200),
    );
  }, [monacoInstance, editorInstance]);
  // Effect to trigger remeasurement of fonts after they have been loaded.
  useEffect(() => {
    document.fonts.ready.then(() => {
      if (monacoInstance) {
        monacoInstance.editor.remeasureFonts();
      }
    });
  }, [monacoInstance]);

  // Effect to react to changes in the execution response.
  useEffect(() => {
    if (monacoInstance && editorInstance) {
      if (executionResponse?.type === 'error' && executionFinished) {
        clearAnnotations();
        const annotations = addErrorAnnotationsFromExecution(
          monacoInstance,
          editorInstance,
          executionResponse,
          firstLineNumber,
        );
        if (annotations !== null) {
          const { widget, decorationsCollection } = annotations;
          runtimeErrorWidgetRef.current = widget;
          decorationsCollectionRef.current.push(decorationsCollection);
        }
      }
    }
  }, [
    executionResponse,
    editorInstance,
    monacoInstance,
    clearAnnotations,
    executionFinished,
    firstLineNumber,
  ]);

  // Effect to reset the editor when resetCounter changes.
  useEffect(() => {
    if (editorInstance && resetCounter > 0) {
      editorInstance.setValue(initialSource);
    }
  }, [editorInstance, initialSource, resetCounter]);

  const addDiagnosticsFromAnalyzer = useCallback(() => {
    if (!monacoInstance || !editorInstance) {
      return;
    }
    const diagnostics = pythonAnalyzer.customDiagnostics(
      monacoInstance,
      editorInstance,
    );
    const visibleDiagnostics = diagnostics.filter(
      (diag) =>
        diag.category === ErrorCategory.SyntaxError || semanticChecksEnabled,
    );
    customDiagnosticsRef.current = visibleDiagnostics;
    decorationsCollectionRef.current.push(
      editorInstance.createDecorationsCollection(visibleDiagnostics),
    );
  }, [editorInstance, monacoInstance, pythonAnalyzer, semanticChecksEnabled]);

  const analyzeSource = useCallback(
    (source: string) => {
      pythonAnalyzer.updateSource(cellIdx, source);
      addDiagnosticsFromAnalyzer();
    },
    [cellIdx, pythonAnalyzer, addDiagnosticsFromAnalyzer],
  );

  // Effect to react to change in preferences for semantic checks.
  // Trigger re-analysis of the current source.
  useEffect(() => {
    if (editorInstance) {
      editorInstance.setValue(editorInstance.getValue());
    }
  }, [semanticChecksEnabled, editorInstance]);

  const handleSourceChanged = (newSource: string | undefined) => {
    if (newSource !== undefined) {
      clearAnnotations();
      analyzeSource(newSource);
      onChange(newSource);
    }
  };

  return (
    <div ref={containerRef} translate='no'>
      <Editor
        language={STRICT_PYTHON3_LANG_ID}
        theme={luceThemeName}
        defaultValue={currentSource}
        onMount={handleEditorMount}
        onChange={handleSourceChanged}
        options={{
          fontFamily: theme.pytamaro.monospaceFontFamily,
          fontSize: theme.pytamaro.monospaceFontSizeRatio * 16,
          lineNumbers: (n) => (n + firstLineNumber - 1).toString(10),
          lineNumbersMinChars: 2,
          minimap: { enabled: false },
          renderLineHighlight: 'none',
          overviewRulerLanes: 0,
          scrollBeyondLastLine: false,
          scrollbar: {
            vertical: 'hidden',
            handleMouseWheel: false,
            useShadows: false,
          },
          readOnly,
          'semanticHighlighting.enabled': semanticChecksEnabled,
        }}
      />
    </div>
  );
}
