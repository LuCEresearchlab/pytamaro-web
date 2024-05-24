import Editor, { loader } from '@monaco-editor/react';
import { debounce } from 'lodash';
import { type editor as EditorNamespace } from 'monaco-editor';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { ExecutionResponse } from '../src/codeExecution';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import { moduleImportCompletionProvider, pytamaroImportCompletionProvider, toolboxImportCompletionProvider } from '../src/monacoSuggestions';
import { addMarkers } from '../src/pythonTraceback';
import scrollToAnchor from '../src/scrollToAnchor';
import theme from '../src/theme';

// Load the same version of monaco-editor specified in the package.json from a
// CDN. We add it as a dependency to get the types, but we avoid bundling it as
// it increases the load on our server, needs to be transpiled with webpack,
// makes the dev server slow).
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.46.0/min/vs' },
});

const themeName = 'luce';
const luceTheme = {
  base: 'vs', // use vscode light as base theme
  inherit: true,
  rules: [],
  colors: {
    'editorLineNumber.foreground': '#60bcd9',
    'editorLineNumber.activeForeground': '#60bcd9',
    'editor.wordHighlightBackground': '#57575710',
  },
};

const LANGUAGE = 'python';
const RUN_CODE_CONDITION_KEY = 'executionAllowedCondition';
export const COLORIZE_CLASSNAME = 'monaco-colorize';

export default function CodeEditor({
  source, executionResponse = undefined, onChange = () => {}, onExecutionRequested = undefined,
  executionAllowed = false, executionFinished = false, firstLineNumber = 1, readOnly = false,
  collapsedErrorMarkers = false,
} :
{ source: string, executionResponse?: ExecutionResponse,
  onChange?: (source: string) => void, onExecutionRequested? : () => void,
  executionAllowed?: boolean, executionFinished?: boolean, firstLineNumber?: number,
  readOnly?: boolean, collapsedErrorMarkers?: boolean }) {
  const { list } = useLocalToolbox();
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const monacoInstance = monacoRef.current;
  const editorInstance = editorRef.current;
  const [
    executionAllowedCondition,
    setExecutionAllowedCondition] = useState<EditorNamespace.IContextKey<boolean> | null>(null);
  const toolboxFunctions = list();

  const handleEditorMount = (
    editor: EditorNamespace.IStandaloneCodeEditor,
    monaco: any,
  ) => {
    monacoRef.current = monaco;
    editorRef.current = editor;

    monaco.editor.defineTheme(themeName, luceTheme);
    monaco.editor.setTheme(themeName);

    setExecutionAllowedCondition(editor.createContextKey(
      RUN_CODE_CONDITION_KEY,
      executionAllowed,
    ));

    let firstHeightUpdate = true;
    const updateHeight = (event: EditorNamespace.IContentSizeChangedEvent) => {
      if (event.contentHeightChanged) {
        if (containerRef.current !== null) {
          containerRef.current.style.height = `${event.contentHeight}px`;
        }
        editor.layout({ width: editor.getLayoutInfo().width, height: event.contentHeight });
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
      // Colorize code
      document.querySelectorAll(`.${COLORIZE_CLASSNAME}`).forEach((element) => {
        monaco.editor.colorizeElement(element, {});
      });
      // eslint-disable-next-line no-param-reassign
      monaco.pytamaroColorized = true;
    }
  };

  const clearMarkers = useCallback(() => {
    if (monacoInstance && editorInstance) {
      // Only clear markers and close the open ones if there are any
      // (otherwise this inappropriately focuses the editor).
      if (monacoInstance.editor.getModelMarkers().length > 0) {
        monacoInstance.editor.setModelMarkers(editorInstance.getModel(), 'owner', []);
        editorInstance.trigger('', 'closeMarkersNavigation', {});
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
    if (monacoInstance && !monacoInstance.pytamaroCompletionProvidersRegistered) {
      const providers = [
        toolboxImportCompletionProvider(monacoInstance, toolboxFunctions),
        moduleImportCompletionProvider(monacoInstance),
        pytamaroImportCompletionProvider(monacoInstance),
      ];
      const disposers = providers.map(
        (provider) => monacoInstance.languages.registerCompletionItemProvider(LANGUAGE, provider),
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
  useEffect(
    () => {
      if (monacoInstance && editorInstance) {
        clearMarkers();
        if (executionResponse?.type === 'error' && executionFinished) {
          addMarkers(
            monacoInstance,
            editorInstance,
            executionResponse,
            firstLineNumber,
            collapsedErrorMarkers,
          );
        }
      }
    },
    [executionResponse, editorInstance, monacoInstance, clearMarkers, executionFinished,
      firstLineNumber, collapsedErrorMarkers],
  );

  const debouncedHandleSourceChanged = debounce((newSource: string | undefined) => {
    if (newSource !== undefined) {
      onChange(newSource);
      clearMarkers();
    }
  }, 200);

  return (
    <div ref={containerRef}>
      <Editor
        language={LANGUAGE}
        theme="luce"
        defaultValue={source}
        onMount={handleEditorMount}
        onChange={debouncedHandleSourceChanged}
        options={{
          fontFamily: theme.pytamaro.monospaceFontFamily,
          fontSize: 1.1 * theme.typography.fontSize,
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
