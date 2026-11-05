import Editor from '@monaco-editor/react';
import { debounce } from 'lodash';
import { type editor as EditorNamespace } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExecutionResponse, PythonMode } from '../src/execution/codeExecution';
import { LiveAnalysisStatus } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  moduleImportCompletionProvider,
  pytamaroImportCompletionProvider,
  toolboxImportCompletionProvider,
} from '../src/monacoSuggestions';
import { PythonName, TextRange } from '../src/python-analyzer/python_analyzer';
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
  showRuntimeAnnotations = false,
  firstLineNumber = 1,
  readOnly = false,
  resetCounter = 0,
  pythonAnalyzer,
  cellIdx,
  setHoveredName = undefined,
  pythonMode = PythonMode.Exec,
}: {
  initialSource: string;
  currentSource: string;
  executionResponse?: ExecutionResponse;
  onChange?: (source: string) => void;
  onExecutionRequested?: () => void;
  executionAllowed?: boolean;
  showRuntimeAnnotations?: boolean;
  firstLineNumber?: number;
  readOnly?: boolean;
  resetCounter?: number;
  pythonAnalyzer: PythonAnalyzer | null;
  cellIdx: number;
  setHoveredName?: (name: PythonName | null) => void;
  pythonMode?: PythonMode;
  evalExprRange?: TextRange | undefined;
}) {
  const { list } = useLocalToolbox();
  const { metadata } = useLocalProfile();
  const { liveAnalysis } = metadata;
  const minimalistic = pythonMode === PythonMode.EvalLastExpr;

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
    useRef<EditorNamespace.IEditorDecorationsCollection | null>(null);
  const staticDecorationsCollectionRef =
    useRef<EditorNamespace.IEditorDecorationsCollection | null>(null);
  const hoveredStaticErrorDecorationRef =
    useRef<EditorNamespace.IEditorDecorationsCollection>(null);
  const evalResultDecorationRef =
    useRef<EditorNamespace.IEditorDecorationsCollection | null>(null);
  const customDiagnosticsRef = useRef<CustomDiagnostic[]>([]);
  const shownDiagnosticRef = useRef<CustomDiagnostic | null>(null);

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
          if (minimalistic) {
            // focus the editor to make it recognizeable as such
            editor.focus();
          }
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
      // Remove possible eval result decorations
      evalResultDecorationRef.current?.clear();
      evalResultDecorationRef.current = null;
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
      monacoInstance._pytamaroCustomProvidersRegistered !== true &&
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
      const position = e.target.position;
      const mouseOverText =
        e.target.type === monacoInstance?.editor.MouseTargetType.CONTENT_TEXT;
      const model = editorInstance?.getModel();
      if (setHoveredName !== undefined) {
        if (!position || !model || !pythonAnalyzer || !mouseOverText) {
          setHoveredName(null);
        } else {
          const hoveredName = pythonAnalyzer.hoveredPythonName(model, position);
          setHoveredName(hoveredName);
        }
      }

      if (runtimeErrorWidgetRef.current) {
        // If there is a runtime error widget shown, do not show static error widgets.
        return;
      }
      // Do not show the widget if we don't have a position or the desired mouse position is beyond it
      // (to avoid showing a widget when the user is hovering on the empty space after the end of the line).
      // We can't simply use `mouseOverText` here, because a diagnostic may be attached to the end of the line, beyond the last character.
      if (!position || e.target.mouseColumn > position.column) {
        clearStaticWidget();
        return;
      }
      const matchingDiagnostics = customDiagnosticsRef.current.filter(
        (diag) =>
          monacoInstance?.Range.containsPosition(diag.range, position) === true,
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
    };
    const handleMouseLeave = () => {
      clearStaticWidget();
      setHoveredName?.(null);
    };
    const delay = 250;
    const debouncedHandleMouseMoved = debounce(handleMouseMoved, delay);
    const debouncedHandleMouseLeave = debounce(handleMouseLeave, delay);
    const mouseMoveDisposer = editorInstance?.onMouseMove(
      debouncedHandleMouseMoved,
    );
    const mouseLeaveDisposer = editorInstance?.onMouseLeave(
      debouncedHandleMouseLeave,
    );
    return () => {
      debouncedHandleMouseMoved.cancel();
      debouncedHandleMouseLeave.cancel();
      mouseMoveDisposer?.dispose();
      mouseLeaveDisposer?.dispose();
    };
  }, [
    monacoInstance,
    editorInstance,
    setHoveredName,
    pythonAnalyzer,
    clearStaticWidget,
    t,
  ]);

  // Effect to trigger remeasurement of fonts after they have been loaded.
  useEffect(() => {
    document.fonts.ready.then(() => {
      if (monacoInstance) {
        monacoInstance.editor.remeasureFonts();
      }
    });
  }, [monacoInstance]);

  const possiblyAddRuntimeErrorAnnotations = useCallback(() => {
    if (monacoInstance && editorInstance) {
      if (executionResponse?.type === 'error' && showRuntimeAnnotations) {
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
    monacoInstance,
    editorInstance,
    executionResponse,
    showRuntimeAnnotations,
    firstLineNumber,
    t,
    clearAnnotations,
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
      liveAnalysis,
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
    if (pythonMode === PythonMode.EvalLastExpr) {
      const decoration = pythonAnalyzer?.evalExprDiagnostics(
        monacoInstance,
        editorInstance,
        cellIdx,
      );
      if (decoration) {
        evalResultDecorationRef.current?.clear();
        evalResultDecorationRef.current =
          editorInstance.createDecorationsCollection([decoration]);
      }
    }
  }, [
    editorInstance,
    monacoInstance,
    pythonAnalyzer,
    cellIdx,
    liveAnalysis,
    firstLineNumber,
    pythonMode,
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

  // Effect to react to change in preferences for live analysis.
  // Trigger re-analysis of the current source.
  useEffect(() => {
    if (editorInstance) {
      clearAnnotations();
      analyzeSource(editorInstance.getValue());
      possiblyAddRuntimeErrorAnnotations();
    }
  }, [
    liveAnalysis,
    editorInstance,
    analyzeSource,
    clearAnnotations,
    possiblyAddRuntimeErrorAnnotations,
  ]);

  const handleSourceChanged = (newSource: string | undefined) => {
    if (newSource !== undefined) {
      clearAnnotations();
      analyzeSource(newSource);
      onChange(newSource);
    }
  };

  // Use an inexistent language if live analysis is completely disabled.
  // This way, Monaco doesn't use even the basic tokenizer for coloring Python.
  const language =
    liveAnalysis === LiveAnalysisStatus.None
      ? 'python-none'
      : STRICT_PYTHON3_LANG_ID;

  return (
    <div ref={containerRef} translate='no'>
      <Editor
        language={language}
        theme={LUCE_THEME_NAME}
        defaultValue={currentSource}
        onMount={handleEditorMount}
        onChange={handleSourceChanged}
        options={{
          fontFamily: theme.pytamaro.monospaceFontFamily,
          fontSize: theme.pytamaro.monospaceFontSizeRatio * 16,
          lineNumbers: minimalistic
            ? 'off'
            : (n) => (n + firstLineNumber - 1).toString(10),
          lineNumbersMinChars: minimalistic ? 0 : 2,
          folding: minimalistic ? false : undefined,
          lineDecorationsWidth: minimalistic ? 0 : undefined,
          minimap: { enabled: false },
          renderLineHighlight: 'none',
          overviewRulerLanes: 0,
          scrollBeyondLastLine: false,
          dropIntoEditor: {
            enabled: false,
          },
          scrollbar: {
            vertical: 'hidden',
            useShadows: false,
            // https://github.com/microsoft/monaco-editor/issues/1853#issuecomment-610254053
            handleMouseWheel: true,
            alwaysConsumeMouseWheel: false,
          },
          stickyScroll: { enabled: false }, // sticky scroll doesn't make sense with infinite height (there's no vertical scrolling)
          readOnly,
          'semanticHighlighting.enabled':
            liveAnalysis === LiveAnalysisStatus.SyntaxSemantics,
        }}
      />
    </div>
  );
}
