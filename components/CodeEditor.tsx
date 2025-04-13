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
import { addMarkers } from '../src/pythonTraceback';
import scrollToAnchor from '../src/scrollToAnchor';
import theme from '../src/theme';
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
  collapsedErrorMarkers = false,
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
  collapsedErrorMarkers?: boolean;
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

  const clearMarkers = useCallback(() => {
    if (monacoInstance && editorInstance) {
      // Delete all the markers
      monacoInstance.editor.setModelMarkers(
        editorInstance.getModel(),
        'owner',
        [],
      );
      // Delete all the decorations
      const entireRange = editorInstance.getModel()?.getFullModelRange();
      const decorations = entireRange
        ? editorInstance.getDecorationsInRange(entireRange)?.map((d) => d.id)
        : [];
      editorInstance.removeDecorations(decorations || []);
      // Close any open markers
      // We do this using MarkerController directly to explicitly avoid focusing the editor,
      // as another editor might have the focus and should not lose it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markerController: any = editorInstance.getContribution(
        'editor.contrib.markerController',
      );
      if (markerController?.close) {
        markerController.close(false); // false: do not focus
      }
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
      clearMarkers();
      if (executionResponse?.type === 'error' && executionFinished) {
        const markersAdded = addMarkers(
          monacoInstance,
          editorInstance,
          executionResponse,
          firstLineNumber,
        );
        // Some (other) editor could have the focus. Do not trigger the "go to
        // next marker" action in that case, as it would steal the cursor from
        // the other editor where the user is typing.
        const someEditorFocused = document.activeElement?.classList.contains(
          'monaco-mouse-cursor-text',
        );
        const otherEditorFocused =
          someEditorFocused &&
          !containerRef.current?.contains(document.activeElement);
        if (markersAdded && !collapsedErrorMarkers && !otherEditorFocused) {
          editorInstance.trigger('', 'editor.action.marker.next', {});
        }
      }
    }
  }, [
    executionResponse,
    editorInstance,
    monacoInstance,
    clearMarkers,
    executionFinished,
    firstLineNumber,
    collapsedErrorMarkers,
  ]);

  // Effect to reset the editor when resetCounter changes.
  useEffect(() => {
    if (editorInstance && resetCounter > 0) {
      editorInstance.setValue(initialSource);
      clearMarkers();
    }
  }, [editorInstance, initialSource, clearMarkers, resetCounter]);

  const addParseErrorMarkers = (parseErrors: ParseError[]) => {
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

  const debouncedAddParseErrorMarkers = debounce((source: string) => {
    addParseErrorMarkers(analyze(source).parse_errors);
  }, 500);

  const debouncedHandleSourceChanged = debounce(
    (newSource: string | undefined) => {
      if (newSource !== undefined) {
        onChange(newSource);
        clearMarkers();
        debouncedAddParseErrorMarkers(newSource);
      }
    },
    100,
  );

  return (
    <div ref={containerRef} translate='no'>
      <Editor
        language={STRICT_PYTHON3_LANG_ID}
        theme='luce'
        defaultValue={currentSource}
        onMount={handleEditorMount}
        onChange={debouncedHandleSourceChanged}
        options={{
          fontFamily: theme.pytamaro.monospaceFontFamily,
          fontSize: theme.pytamaro.monospaceFontSize,
          lineNumbers: (n) => (n + firstLineNumber - 1).toString(10),
          lineNumbersMinChars: 2,
          minimap: { enabled: false },
          renderLineHighlight: 'none',
          overviewRulerLanes: 0,
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true,
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
