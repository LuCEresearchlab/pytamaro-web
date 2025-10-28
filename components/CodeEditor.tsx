import Editor from '@monaco-editor/react';
import { debounce } from 'lodash';
import { type editor as EditorNamespace } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExecutionResponse } from '../src/codeExecution';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import {
  moduleImportCompletionProvider,
  pytamaroImportCompletionProvider,
  toolboxImportCompletionProvider,
} from '../src/monacoSuggestions';
import { analyze, ParseError } from '../src/python-analyzer/python_analyzer';
import {
  addErrorAnnotations,
  TRACEBACK_MESSAGE_DECORATION_CLASSNAME,
  TRACEBACK_TIDLE_DECORATION_CLASSNAME,
} from '../src/pythonTraceback';
import scrollToAnchor from '../src/scrollToAnchor';
import theme from '../src/theme';
import { ErrorMessageWidget } from './editor/ErrorMessageWidget';
import {
  registerCustomPythonLanguage,
  STRICT_PYTHON3_LANG_ID,
} from './editor/strictPython3';
import {
  colorizeElements,
  configureEditor,
  luceTheme,
  RUN_CODE_CONDITION_KEY,
  themeName,
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
}) {
  const { list } = useLocalToolbox();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<EditorNamespace.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const monacoInstance = monacoRef.current;
  const editorInstance = editorRef.current;
  const [executionAllowedCondition, setExecutionAllowedCondition] =
    useState<EditorNamespace.IContextKey<boolean> | null>(null);
  const toolboxFunctions = list();
  const errorWidgetRef = useRef<ErrorMessageWidget | null>(null);

  const handleEditorMount = (
    editor: EditorNamespace.IStandaloneCodeEditor,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    monaco: any,
  ) => {
    monacoRef.current = monaco;
    editorRef.current = editor;

    registerCustomPythonLanguage(monaco);

    monaco.editor.defineTheme(themeName, luceTheme);
    monaco.editor.setTheme(themeName);

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

  const clearAnnotations = useCallback(() => {
    if (monacoInstance && editorInstance && errorWidgetRef.current) {
      // Dispose the error widget
      errorWidgetRef.current.dispose();
      // Delete all the decorations
      const entireRange = editorInstance.getModel()?.getFullModelRange();
      const decorations = entireRange
        ? editorInstance
            .getDecorationsInRange(entireRange)
            ?.filter(
              (d) =>
                d.options.className === TRACEBACK_TIDLE_DECORATION_CLASSNAME ||
                d.options.className === TRACEBACK_MESSAGE_DECORATION_CLASSNAME,
            )
            .map((d) => d.id)
        : [];
      editorInstance.removeDecorations(decorations || []);
    }
  }, [monacoInstance, editorInstance]);

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

  // Effect to register the completion providers.
  useEffect(() => {
    if (
      monacoInstance &&
      !monacoInstance.pytamaroCompletionProvidersRegistered
    ) {
      const providers = [
        toolboxImportCompletionProvider(monacoInstance, toolboxFunctions),
        moduleImportCompletionProvider(monacoInstance),
        pytamaroImportCompletionProvider(monacoInstance),
      ];
      const disposers = providers.map((provider) =>
        monacoInstance.languages.registerCompletionItemProvider(
          STRICT_PYTHON3_LANG_ID,
          provider,
        ),
      );
      monacoInstance.pytamaroCompletionProvidersRegistered = true;
      return () => {
        disposers.forEach((disposer) => disposer.dispose());
        monacoInstance.pytamaroCompletionProvidersRegistered = false;
      };
    }
    return () => {};
  }, [monacoInstance, toolboxFunctions]);

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
      clearAnnotations();
      if (executionResponse?.type === 'error' && executionFinished) {
        const errorWidget = addErrorAnnotations(
          monacoInstance,
          editorInstance,
          executionResponse,
          firstLineNumber,
        );
        if (errorWidget) {
          errorWidgetRef.current = errorWidget;
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

  const setParseErrorMarkers = (parseErrors: ParseError[]) => {
    if (monacoInstance && editorInstance) {
      const model = editorInstance.getModel();
      if (model) {
        monacoInstance.editor.setModelMarkers(
          model,
          'owner',
          parseErrors.map((error) => {
            const startPosition = model.getPositionAt(error.location[0]);
            const endPosition = model.getPositionAt(error.location[1]);
            return {
              startLineNumber: startPosition.lineNumber,
              startColumn: startPosition.column,
              endLineNumber: endPosition.lineNumber,
              endColumn: endPosition.column,
              message: error.message,
              severity: monacoInstance.MarkerSeverity.Error,
            };
          }),
        );
      }
    }
  };

  const handleSourceChanged = debounce((newSource: string | undefined) => {
    if (newSource !== undefined) {
      onChange(newSource);
      clearAnnotations();
      setParseErrorMarkers(analyze(newSource).parse_errors);
    }
  }, 50);

  return (
    <div ref={containerRef} translate='no'>
      <Editor
        language={STRICT_PYTHON3_LANG_ID}
        theme='luce'
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
        }}
      />
    </div>
  );
}
