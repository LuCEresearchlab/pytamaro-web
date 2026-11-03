import Editor from '@monaco-editor/react';
import { debounce, isEqual } from 'lodash';
import { type editor as EditorNamespace } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorMessageWidget } from '../src/editor/ErrorMessageWidget';
import type { CustomDiagnostic } from '../src/editor/diagnostics';
import type { EditorContext } from '../src/editor/editorContext';
import { registerCustomProviders } from '../src/editor/providers';
import { STRICT_PYTHON3_LANG_ID } from '../src/editor/strictPython3';
import {
  configureEditor,
  LUCE_THEME_NAME,
  MonacoForPyTamaro,
  registerPyTamaroLanguageAndTheme,
  RUN_CODE_CONDITION_KEY,
} from '../src/editor/utils';
import { ExecutionResponse, PythonMode } from '../src/execution/codeExecution';
import { isPythonFileName } from '../src/ideFiles';
import { LiveAnalysisStatus } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { PythonName, TextRange } from '../src/python-analyzer/python_analyzer';
import { addErrorAnnotationsFromExecution } from '../src/pythonTraceback';
import scrollToAnchor from '../src/scrollToAnchor';
import theme from '../src/theme';

configureEditor();

export default function CodeEditor({
  executionResponse = undefined,
  onChange = () => {},
  onExecutionRequested = undefined,
  executionAllowed = false,
  showRuntimeAnnotations = false,
  onRuntimeErrorDismissed = undefined,
  firstLineNumber = 1,
  readOnly = false,
  resetCounter = 0,
  context,
  setHoveredName = undefined,
  pythonMode = PythonMode.Exec,
  autoHeight = true,
  modelPath = undefined,
}: {
  executionResponse?: ExecutionResponse;
  onChange?: (source: string) => void;
  onExecutionRequested?: () => void;
  executionAllowed?: boolean;
  showRuntimeAnnotations?: boolean;
  onRuntimeErrorDismissed?: () => void;
  firstLineNumber?: number;
  readOnly?: boolean;
  resetCounter?: number;
  context: EditorContext;
  setHoveredName?: (name: PythonName | null) => void;
  pythonMode?: PythonMode;
  evalExprRange?: TextRange | undefined;
  autoHeight?: boolean;
  modelPath?: string;
}) {
  const { metadata } = useLocalProfile();
  const { liveAnalysis } = metadata;
  const minimalistic = pythonMode === PythonMode.EvalLastExpr;

  const currentSource = context.currentSource();

  const [monacoInstance, setMonacoInstance] =
    useState<MonacoForPyTamaro | null>(null);
  const [editorInstance, setEditorInstance] =
    useState<EditorNamespace.IStandaloneCodeEditor | null>(null);
  const [model, setModel] = useState<EditorNamespace.ITextModel | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const [executionAllowedCondition, setExecutionAllowedCondition] =
    useState<EditorNamespace.IContextKey<boolean> | null>(null);
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

  // Keep the latest dismissal handler in a ref, so it doesn't force the
  // runtime-error annotations to be recreated on every render (and so the
  // widget always calls the most recent handler).
  const onRuntimeErrorDismissedRef = useRef(onRuntimeErrorDismissed);
  useEffect(() => {
    onRuntimeErrorDismissedRef.current = onRuntimeErrorDismissed;
  }, [onRuntimeErrorDismissed]);

  const { t } = useLocalTranslation();

  const handleEditorMount = (
    editor: EditorNamespace.IStandaloneCodeEditor,
    monaco: MonacoForPyTamaro,
  ) => {
    setMonacoInstance(monaco);
    setEditorInstance(editor);

    registerPyTamaroLanguageAndTheme(monaco);
    registerCustomProviders(monaco);

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
    if (autoHeight) {
      editor.onDidContentSizeChange(updateHeight);
      // Manually trigger the first height update.
      updateHeight({
        contentHeight: editor.getContentHeight(),
        contentHeightChanged: true,
        contentWidth: editor.getContentWidth(),
        contentWidthChanged: true,
      });
    }
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

  useEffect(() => {
    if (!editorInstance) {
      return () => {};
    }
    setModel(editorInstance.getModel());
    const subscription = editorInstance.onDidChangeModel(() => {
      setModel(editorInstance.getModel());
    });
    return () => {
      subscription.dispose();
    };
  }, [editorInstance]);

  // URI of the model identified by `modelPath`, if the editor has a path.
  const modelUri =
    monacoInstance !== null && modelPath !== undefined
      ? monacoInstance.Uri.parse(modelPath).toString()
      : null;

  // `@monaco-editor/react` keeps one model per `path`, so switching from one
  // file to another reuses its model instead of creating a new editor. This is
  // what keeps tab switching flicker-free and preserves cursor, scroll and
  // undo history, but a reused model may be stale: its file can have changed
  // while it wasn't shown (e.g., edited in another browser tab, or deleted and
  // created again). Bring it up to date before binding it to the session.
  useEffect(() => {
    if (model === null || modelUri === null) {
      return;
    }
    // For one render after `modelPath` and `context` have switched, `model`
    // may still be the previous file's model: only touch the matching one.
    if (model.uri.toString() !== modelUri) {
      return;
    }
    const source = context.currentSource();
    if (model.getValue() !== source) {
      model.setValue(source);
    }
  }, [model, modelUri, context]);

  // Bind this editor's model to its document in the session, so that the
  // session analyzes and persists every content change (and providers can find it).
  useEffect(() => {
    if (
      model === null ||
      (modelUri !== null && model.uri.toString() !== modelUri)
    ) {
      return () => {};
    }
    context.attachModel(model);
    return () => {
      context.detachModel(model);
    };
  }, [model, modelUri, context]);

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
        label: t('runCodeCell'),
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
  }, [editorInstance, monacoInstance, onExecutionRequested, t]);

  useEffect(() => {
    const handleMouseMoved = (e: EditorNamespace.IEditorMouseEvent) => {
      const position = e.target.position;
      const mouseOverText =
        e.target.type === monacoInstance?.editor.MouseTargetType.CONTENT_TEXT;
      const model = editorInstance?.getModel();
      if (setHoveredName !== undefined) {
        if (!position || !model || !mouseOverText) {
          setHoveredName(null);
        } else {
          const hoveredName = context.hoveredPythonName(model, position);
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
    context,
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

  // Read at reset time, so a new context doesn't trigger a reset by itself.
  const contextRef = useRef(context);
  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  // Effect to reset the editor when resetCounter changes.
  useEffect(() => {
    if (editorInstance && resetCounter > 0) {
      editorInstance.setValue(contextRef.current.initialSource());
    }
  }, [editorInstance, contextRef, resetCounter]);

  const addDiagnosticsFromAnalyzer = useCallback(() => {
    if (!monacoInstance || !editorInstance) {
      return;
    }
    clearStaticAnnotations();
    const diagnostics = context.diagnostics(liveAnalysis);
    customDiagnosticsRef.current = diagnostics;
    staticDecorationsCollectionRef.current =
      editorInstance.createDecorationsCollection(diagnostics);
    if (pythonMode === PythonMode.EvalLastExpr) {
      const decoration = context.evalExprDiagnostic?.(
        monacoInstance,
        editorInstance,
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
    context,
    liveAnalysis,
    pythonMode,
    clearStaticAnnotations,
  ]);

  // A document's diagnostics can depend on other documents (e.g., a name that
  // is now defined in another cell or file), so redraw them when the session
  // re-analyzes this document, not only when this editor's own content changes.
  useEffect(() => {
    const refreshDiagnostics = () => {
      const diagnostics = context.diagnostics(liveAnalysis);
      // Skip no-op redraws, so that a hover widget isn't dismissed by an
      // unrelated edit that changed nothing here.
      if (!isEqual(diagnostics, customDiagnosticsRef.current)) {
        addDiagnosticsFromAnalyzer();
      }
    };
    const unsubscribe = context.subscribeToAnalysis(refreshDiagnostics);
    return unsubscribe;
  }, [context, liveAnalysis, addDiagnosticsFromAnalyzer]);

  const analyzeSource = useCallback(
    (source: string) => {
      // Idempotent: the session's own model listener may have already done
      // this. Calling it here makes the diagnostics below independent of the
      // order in which the two listeners fire.
      context.updateSource(source);
      addDiagnosticsFromAnalyzer();
    },
    [context, addDiagnosticsFromAnalyzer],
  );

  const possiblyAddRuntimeErrorAnnotations = useCallback(() => {
    if (monacoInstance && editorInstance) {
      if (executionResponse?.type === 'error' && showRuntimeAnnotations) {
        clearAnnotations();
        const onClose = () => {
          clearAnnotations();
          analyzeSource(editorInstance.getValue());
          onRuntimeErrorDismissedRef.current?.();
        };
        const annotations = addErrorAnnotationsFromExecution(
          monacoInstance,
          editorInstance,
          executionResponse,
          firstLineNumber,
          t,
          context.runtimeFileName,
          onClose,
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
    analyzeSource,
    context,
  ]);

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
    model,
    analyzeSource,
    clearAnnotations,
    possiblyAddRuntimeErrorAnnotations,
  ]);

  // Keep the latest `onChange` in a ref, so the listener below doesn't have to
  // be re-registered when the parent passes a new function.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // React to every content change of the model (typing, reset, external sync).
  useEffect(() => {
    if (!model) {
      return () => {};
    }
    const subscription = model.onDidChangeContent(() => {
      const source = model.getValue();
      clearAnnotations();
      analyzeSource(source);
      onChangeRef.current(source);
    });
    return () => {
      subscription.dispose();
    };
  }, [model, clearAnnotations, analyzeSource]);

  const python = modelPath === undefined || isPythonFileName(modelPath);
  // Use an inexistent language if the file is not Python or the live analysis is completely disabled.
  // This way, Monaco doesn't use even the basic tokenizer for coloring Python.
  const language =
    !python || liveAnalysis === LiveAnalysisStatus.None
      ? undefined
      : STRICT_PYTHON3_LANG_ID;

  return (
    <div
      ref={containerRef}
      translate='no'
      style={autoHeight ? undefined : { height: '100%' }}
    >
      <Editor
        language={language}
        path={modelPath}
        theme={LUCE_THEME_NAME}
        defaultValue={currentSource}
        onMount={handleEditorMount}
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
            vertical: autoHeight ? 'hidden' : 'auto',
            useShadows: false,
            // https://github.com/microsoft/monaco-editor/issues/1853#issuecomment-610254053
            handleMouseWheel: true,
            alwaysConsumeMouseWheel: false,
          },
          // Sticky scroll only makes sense when the editor has its own
          // vertical scrollbar (i.e., in the IDE).
          stickyScroll: { enabled: !autoHeight },
          // The IDE puts the editor in a container that clips its overflow, so
          // otherwise content widgets (e.g., error bubbles) are cut off when
          // they extend beyond the editor's box (e.g., above the first line or
          // to the left of the first column). Fixed positioning lets them
          // escape the container while keeping them inside the window.
          fixedOverflowWidgets: !autoHeight,
          readOnly,
          'semanticHighlighting.enabled':
            liveAnalysis === LiveAnalysisStatus.SyntaxSemantics,
        }}
      />
    </div>
  );
}
