import { loader, useMonaco } from '@monaco-editor/react';

export const themeName = 'luce';
export const luceTheme = {
  base: 'vs', // use vscode light as base theme
  inherit: true,
  rules: [],
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
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.46.0/min/vs' },
  });
}

export function colorizeElements(monaco: ReturnType<typeof useMonaco>) {
  document
    .querySelectorAll<HTMLElement>(`.${COLORIZE_CLASSNAME}:not(.vs)`)
    .forEach((element) => {
      monaco?.editor.colorizeElement(element, {});
    });
}
