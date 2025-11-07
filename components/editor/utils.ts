import { loader, Monaco } from '@monaco-editor/react';
import { type editor as EditorNamespace } from 'monaco-editor';

export const luceThemeName = 'luce';
export const luceTheme: EditorNamespace.IStandaloneThemeData = {
  base: 'vs', // use vscode light as base theme
  inherit: true,
  rules: [
    // Colors manually extracted from https://github.com/microsoft/vscode/blob/4ce6f26ef7a68b49140abc02cf221c86370b6c57/extensions/theme-defaults/themes/light_plus.json
    {
      foreground: '#0070C1',
      token: 'builtinConstant',
    },
    {
      token: 'method',
      foreground: '#795E26',
    },
    {
      token: 'function',
      foreground: '#795E26',
    },
    {
      token: 'class',
      foreground: '#267f99',
    },
    {
      token: 'typeParameter',
      foreground: '#267f99',
    },
  ],
  colors: {
    'editorLineNumber.foreground': '#60bcd9',
    'editorLineNumber.activeForeground': '#60bcd9',
    'editor.wordHighlightBackground': '#57575710',
  },
};

export const RUN_CODE_CONDITION_KEY = 'executionAllowedCondition';
export const COLORIZE_CLASSNAME = 'monaco-colorize';

export function configureEditor() {
  // Load the same version of monaco-editor specified in the package.json from a
  // CDN. We add it as a dependency to get the types, but we avoid bundling it as
  // it increases the load on our server, needs to be transpiled with webpack,
  // makes the dev server slow).
  loader.config({
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' },
  });
}

export function colorizeElements(monaco: Monaco) {
  document
    .querySelectorAll<HTMLElement>(`.${COLORIZE_CLASSNAME}:not(.vs)`)
    .forEach((element) => {
      monaco.editor.colorizeElement(element, {});
    });
}
