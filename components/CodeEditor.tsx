import Editor, { loader } from '@monaco-editor/react';
import type { editor as EditorNamespace } from 'monaco-editor';
import { useEffect, useRef } from 'react';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import { moduleImportCompletionProvider, pytamaroImportCompletionProvider, toolboxImportCompletionProvider } from '../src/monacoSuggestions';
import theme from '../src/theme';

// Load the same version of monaco-editor specified in the package.json from a
// CDN. We add it as a dependency to get the types, but we avoid bundling it as
// it increases the load on our server, needs to be transpiled with webpack,
// makes the dev server slow).
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/min/vs' },
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

export const COLORIZE_CLASSNAME = 'monaco-colorize';

export default function CodeEditor({
  source, onChange = () => {}, firstLineNumber = 1, readOnly = false,
} :
{ source: string, onChange?: (source: string) => void, firstLineNumber?: number,
  readOnly?: boolean }) {
  const { list } = useLocalToolbox();
  const monacoRef = useRef<any>(null);
  const monacoInstance = monacoRef.current;
  const toolboxFunctions = list();

  const handleEditorMount = (
    editor: EditorNamespace.IStandaloneCodeEditor,
    monaco: any,
  ) => {
    monacoRef.current = monaco;
    monaco.editor.defineTheme(themeName, luceTheme);
    monaco.editor.setTheme(themeName);
    const updateHeight = () => {
      editor.layout({ width: editor.getLayoutInfo().width, height: editor.getContentHeight() });
    };
    editor.onDidContentSizeChange(updateHeight);

    if (monaco.pytamaroColorized === undefined) {
      // Colorize code
      document.querySelectorAll(`.${COLORIZE_CLASSNAME}`).forEach((element) => {
        monaco.editor.colorizeElement(element, {});
      });
      // eslint-disable-next-line no-param-reassign
      monaco.pytamaroColorized = true;
    }

    // After the editor has been loaded and its height has been updated,
    // (re-)scroll the anchor element into view.
    updateHeight();
    const { hash } = window.location;
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView();
      }
    }
  };

  useEffect(() => {
    if (monacoInstance && monacoInstance.pytamaroProvidesRegistered === undefined) {
      const providers = [
        toolboxImportCompletionProvider(monacoInstance, toolboxFunctions),
        moduleImportCompletionProvider(monacoInstance),
        pytamaroImportCompletionProvider(monacoInstance),
      ];
      const disposers = providers.map(
        (provider) => monacoInstance.languages.registerCompletionItemProvider(LANGUAGE, provider),
      );
      monacoInstance.pytamaroProvidesRegistered = true;
      return () => {
        disposers.forEach((disposer) => disposer.dispose());
      };
    }
    return () => {};
  }, [monacoInstance, toolboxFunctions]);

  return (
    <Editor
      language={LANGUAGE}
      theme="luce"
      value={source}
      onChange={(value) => value !== undefined && onChange(value)}
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
      onMount={handleEditorMount}
    />
  );
}
