import Editor from '@monaco-editor/react';
import { debounce, DebouncedFunc, throttle } from 'lodash';
import { editor, type editor as EditorNamespace } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExecutionResponse } from '../src/codeExecution';
import { LiveChecksStatus } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
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
  retrievePythonAnalyzer,
  storeCellIdx,
  storePreviousLinesCount,
  storePythonAnalyzer,
} from '../src/usePythonAnalyzer';
import { ErrorMessageWidget } from './editor/ErrorMessageWidget';
import { STRICT_PYTHON3_LANG_ID } from './editor/strictPython3';
import {
  configureEditor,
  LUCE_THEME_NAME,
  MonacoForPyTamaro,
  registerPyTamaroLanguageAndTheme,
  RUN_CODE_CONDITION_KEY,
} from './editor/utils';

configureEditor();

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
  pythonAnalyzer: PythonAnalyzer | null;
  cellIdx: number;
}) {
  const { list } = useLocalToolbox();
  const { metadata } = useLocalProfile();
  const { liveChecks } = metadata;

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
  const runtimeDecorationsCollectionRef =
    useRef<editor.IEditorDecorationsCollection | null>(null);
  const staticDecorationsCollectionRef =
    useRef<editor.IEditorDecorationsCollection | null>(null);
  const hoveredStaticErrorDecorationRef =
    useRef<editor.IEditorDecorationsCollection>(null);
  const customDiagnosticsRef = useRef<CustomDiagnostic[]>([]);
  const shownDiagnosticRef = useRef<CustomDiagnostic | null>(null);
  const debouncedShowDiagnosticOnHover = useRef<DebouncedFunc<
    () => void
  > | null>(null);

  const { t } = useLocalTranslation();

  const handleEditorMount = (
    editor: EditorNamespace.IStandaloneCodeEditor,
    monaco: MonacoForPyTamaro,
  ) => {
    monacoRef.current = monacoInstance = monaco;
    editorRef.current = editorInstance = editor;

    registerPyTamaroLanguageAndTheme(monaco);

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
  };

  const clearStaticWidget = useCallback(() => {
    // Clear the possible static error widget
    staticErrorWidgetRef.current?.dispose();
    staticErrorWidgetRef.current = null;
    // And its possible decoration on hover
    hoveredStaticErrorDecorationRef.current?.clear();
    hoveredStaticErrorDecorationRef.current = null;
    // And the shown diagnostic
    shownDiagnosticRef.current = null;
    // Also cancel possible pending showing of a diagnostic widget/decorations
    debouncedShowDiagnosticOnHover.current?.cancel();
  }, []);

  const clearStaticAnnotations = useCallback(() => {
    // Clear a possible static widget and related decoration
    clearStaticWidget();
    // Clear the memorized diagnostics
    customDiagnosticsRef.current = [];
    // And finally also clear other possible static decorations
    staticDecorationsCollectionRef.current?.clear();
    staticDecorationsCollectionRef.current = null;
  }, [clearStaticWidget]);

  const clearAnnotations = useCallback(() => {
    if (monacoInstance && editorInstance) {
      // Remove possible widgets
      runtimeErrorWidgetRef.current?.dispose();
      runtimeErrorWidgetRef.current = null;
      // Remove possible collections of decorations
      runtimeDecorationsCollectionRef.current?.clear();
      runtimeDecorationsCollectionRef.current = null;
      // Remove static error annotations
      clearStaticAnnotations();
    }
  }, [monacoInstance, editorInstance, clearStaticAnnotations]);

  // Effects to update the previous lines count and the reference to the PythonAnalyzer
  // stored inside the model (to be used, e.g., by the semantic tokens provider).
  // If Monaco allowed registering the semantic tokens provider per editor instance, this terrible hack would not be necessary.
  // Unfortunately, Monaco only allows registering the provider per language,
  // so we need to inject stuff inside the model (which gets passed to the provider) to make it work correctly
  // for all our cases with multiple editors and multiple analyzers (e.g., in the "SaveToToolbox" dialog).
  useEffect(() => {
    if (editorInstance) {
      storePreviousLinesCount(editorInstance, firstLineNumber - 1);
    }
  }, [firstLineNumber, editorInstance]);
  useEffect(() => {
    if (editorInstance && pythonAnalyzer) {
      storePythonAnalyzer(editorInstance, pythonAnalyzer);
    }
  }, [editorInstance, pythonAnalyzer]);
  useEffect(() => {
    if (editorInstance) {
      storeCellIdx(editorInstance, cellIdx);
    }
  }, [cellIdx, editorInstance]);

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

  const toolboxFunctionsStatus = JSON.stringify(toolboxFunctions);

  // Effect to register various providers (e.g, completion, semantic tokens).
  useEffect(() => {
    if (
      monacoInstance &&
      !monacoInstance._pytamaroCustomProvidersRegistered &&
      pythonAnalyzer
    ) {
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
            provideDocumentRangeSemanticTokens: (model, range) =>
              retrievePythonAnalyzer(model).documentRangeSemanticTokens(
                model,
                range,
              ),
            getLegend: pythonAnalyzer.semanticTokensLegend,
          },
        ),
      );
      // eslint-disable-next-line no-param-reassign
      monacoInstance._pytamaroCustomProvidersRegistered = true;
      return () => {
        disposers.forEach((disposer) => disposer?.dispose());
        if (monacoInstance)
          monacoInstance._pytamaroCustomProvidersRegistered = false;
      };
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoInstance, pythonAnalyzer, toolboxFunctionsStatus]);

  useEffect(() => {
    const handleMouseMoved = (e: EditorNamespace.IEditorMouseEvent) => {
      if (runtimeErrorWidgetRef.current) {
        // If there is a runtime error widget shown, do not show static error widgets.
        return;
      }
      // Find position under mouse
      // Check if there is a diagnostic at that position
      const position = e.target.position;
      if (!position) {
        clearStaticWidget();
        return;
      }
      const matchingDiagnostics = customDiagnosticsRef.current.filter((diag) =>
        monacoInstance?.Range.containsPosition(diag.range, position),
      );
      // Sort diagnostics by range length (shorter ranges first, i.e., more specific diagnostics first).
      matchingDiagnostics.sort((d1, d2) => {
        return monacoInstance!.Range.containsRange(d1.range, d2.range)
          ? 1
          : monacoInstance!.Range.containsRange(d2.range, d1.range)
            ? -1
            : 0;
      });
      const selectedDiagnosticToShow = matchingDiagnostics[0];
      if (selectedDiagnosticToShow === undefined) {
        clearStaticWidget();
        return;
      }
      if (selectedDiagnosticToShow === shownDiagnosticRef.current) {
        // The widget for the diagnostic is already shown
        // (and we don't want to re-create it).
        return;
      }
      clearStaticWidget();
      debouncedShowDiagnosticOnHover.current = debounce(() => {
        shownDiagnosticRef.current = selectedDiagnosticToShow;
        const widget = new ErrorMessageWidget(
          monacoInstance!,
          editorInstance!,
          selectedDiagnosticToShow.range,
          selectedDiagnosticToShow.message,
          false,
          selectedDiagnosticToShow.category,
          t,
        );
        hoveredStaticErrorDecorationRef.current =
          editorInstance!.createDecorationsCollection([
            {
              range: selectedDiagnosticToShow.range,
              options: {
                className: 'analyzer-diagnostic-code-highlight',
                showIfCollapsed: true,
              },
            },
          ]);
        staticErrorWidgetRef.current = widget;
      }, 150);
      debouncedShowDiagnosticOnHover.current();
    };
    const mouseMoveDisposer = editorInstance?.onMouseMove(
      throttle((e) => handleMouseMoved(e), 100, {
        // Invoke on the leading edge to make it occur before any mouse leave event.
        leading: true,
        trailing: false,
      }),
    );
    const mouseLeaveDisposer = editorInstance?.onMouseLeave(
      throttle(() => {
        clearStaticWidget();
      }),
      100,
    );
    return () => {
      mouseMoveDisposer?.dispose();
      mouseLeaveDisposer?.dispose();
    };
  }, [monacoInstance, editorInstance, clearStaticWidget, t]);

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
          t,
        );
        if (annotations !== null) {
          const { widget, decorationsCollection } = annotations;
          runtimeErrorWidgetRef.current = widget;
          runtimeDecorationsCollectionRef.current = decorationsCollection;
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
    t,
  ]);

  // Effect to reset the editor when resetCounter changes.
  useEffect(() => {
    if (editorInstance && resetCounter > 0) {
      editorInstance.setValue(initialSource);
    }
  }, [editorInstance, initialSource, resetCounter]);

  const addDiagnosticsFromAnalyzer = useCallback(() => {
    if (!monacoInstance || !editorInstance || !pythonAnalyzer) {
      return;
    }
    const diagnostics = pythonAnalyzer.customDiagnostics(
      monacoInstance,
      cellIdx,
      liveChecks,
    );
    const diagnosticsCurrentCell = diagnostics.filter(
      (diag) => diag.range.startLineNumber >= firstLineNumber,
    );
    const diagnosticsCurrentCellAdjusted = diagnosticsCurrentCell.map(
      (diag) => {
        const previousLines = firstLineNumber - 1;
        return {
          ...diag,
          range: new monacoInstance!.Range(
            diag.range.startLineNumber - previousLines,
            diag.range.startColumn,
            diag.range.endLineNumber - previousLines,
            diag.range.endColumn,
          ),
        };
      },
    );
    customDiagnosticsRef.current = diagnosticsCurrentCellAdjusted;
    staticDecorationsCollectionRef.current =
      editorInstance.createDecorationsCollection(
        diagnosticsCurrentCellAdjusted,
      );
  }, [
    editorInstance,
    monacoInstance,
    pythonAnalyzer,
    cellIdx,
    liveChecks,
    firstLineNumber,
  ]);

  const analyzeSource = useCallback(
    (source: string) => {
      if (!pythonAnalyzer) {
        return;
      }
      pythonAnalyzer.updateSource(cellIdx, source);
      addDiagnosticsFromAnalyzer();
    },
    [cellIdx, pythonAnalyzer, addDiagnosticsFromAnalyzer],
  );

  // Effect to react to change in preferences for live checks.
  // Trigger re-analysis of the current source.
  useEffect(() => {
    if (editorInstance) {
      clearAnnotations();
      analyzeSource(editorInstance.getValue());
    }
  }, [liveChecks, editorInstance, analyzeSource, clearAnnotations]);

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
        theme={LUCE_THEME_NAME}
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
          'semanticHighlighting.enabled':
            liveChecks === LiveChecksStatus.SyntaxSemantics,
        }}
      />
    </div>
  );
}
