import Editor, { loader } from '@monaco-editor/react';
import type { editor as EditorNamespace } from 'monaco-editor';
import theme from '../src/theme';

// Load the same version of monaco-editor specified in the package.json from a
// CDN. We add it as a dependency to get the types, but we avoid bundling it as
// it increases the load on our server, needs to be transpiled with webpack,
// makes the dev server slow).
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/min/vs' },
});

const handleEditorMount = (editor: EditorNamespace.IStandaloneCodeEditor, monaco: any) => {
  const themeName = 'luce';
  monaco.editor.defineTheme(themeName, {
    base: 'vs', // use vscode light as base theme
    inherit: true,
    rules: [],
    colors: {
      'editorLineNumber.foreground': '#60bcd9',
      'editorLineNumber.activeForeground': '#60bcd9',
      'editor.wordHighlightBackground': '#57575710',
    },
  });
  monaco.editor.setTheme(themeName);
  const updateHeight = () => {
    editor.layout({ width: editor.getLayoutInfo().width, height: editor.getContentHeight() });
  };
  editor.onDidContentSizeChange(updateHeight);
};

export default function CodeEditor({
  source, onChange = () => {}, firstLineNumber = 1, readOnly = false,
} :
{ source: string, onChange?: (source: string) => void, firstLineNumber?: number,
  readOnly?: boolean }) {
  return (
    <Editor
      language="python"
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
