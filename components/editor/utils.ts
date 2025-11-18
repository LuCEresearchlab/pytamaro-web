import { loader, type Monaco } from '@monaco-editor/react';
import { type editor as EditorNamespace } from 'monaco-editor';
import theme from '../../src/theme';
import { registerCustomPythonLanguage } from './strictPython3';

const FUNCTION_COLOR = theme.pytamaro.palette.brown;
const VARIABLE_COLOR = theme.pytamaro.palette.blue;
const TYPE_COLOR = theme.pytamaro.palette.orange;
const LITERAL_COLOR = theme.pytamaro.palette.green;
const STRING_LITERAL_COLOR = theme.pytamaro.palette.gold;

export const LUCE_THEME_NAME = 'luce';
export const LUCE_THEME: EditorNamespace.IStandaloneThemeData = {
  base: 'vs', // vscode light as base theme
  inherit: true,
  rules: [
    {
      token: 'builtinConstant',
      foreground: LITERAL_COLOR,
    },
    {
      token: 'method',
      foreground: FUNCTION_COLOR,
    },
    {
      token: 'method.definition',
      foreground: FUNCTION_COLOR,
      fontStyle: 'underline',
    },
    {
      token: 'function',
      foreground: FUNCTION_COLOR,
    },
    {
      token: 'function.definition',
      foreground: FUNCTION_COLOR,
      fontStyle: 'underline',
    },
    {
      token: 'class',
      foreground: TYPE_COLOR,
    },
    {
      token: 'class.definition',
      foreground: TYPE_COLOR,
      fontStyle: 'underline',
    },
    {
      token: 'typeParameter',
      foreground: TYPE_COLOR,
    },
    {
      token: 'typeParameter.definition',
      foreground: TYPE_COLOR,
      fontStyle: 'underline',
    },
    {
      token: 'parameter',
      foreground: VARIABLE_COLOR,
    },
    {
      token: 'parameter.definition',
      foreground: VARIABLE_COLOR,
      fontStyle: 'underline',
    },
    {
      token: 'variable',
      foreground: VARIABLE_COLOR,
    },
    {
      token: 'variable.definition',
      foreground: VARIABLE_COLOR,
      fontStyle: 'underline',
    },
    {
      token: 'keyword',
      foreground: '#000000',
      fontStyle: 'bold',
    },
    {
      token: 'comment',
      foreground: '#909090',
      fontStyle: 'italic',
    },
    {
      token: 'number',
      foreground: LITERAL_COLOR,
    },
    {
      token: 'literal',
      foreground: LITERAL_COLOR,
    },
    {
      token: 'string',
      foreground: STRING_LITERAL_COLOR,
    },
  ],
  colors: {
    'editorLineNumber.foreground': '#60bcd9',
    'editorLineNumber.activeForeground': '#60bcd9',
    'editor.wordHighlightBackground': '#57575710',
  },
};

export const RUN_CODE_CONDITION_KEY = 'executionAllowedCondition';

export function configureEditor() {
  // Load the same version of monaco-editor specified in the package.json from a
  // CDN. We add it as a dependency to get the types, but we avoid bundling it as
  // it increases the load on our server, needs to be transpiled with webpack,
  // makes the dev server slow).
  loader.config({
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' },
  });
}

export type MonacoForPyTamaro = Monaco & {
  _pytamaroCustomProvidersRegistered?: boolean;
  _pytamaroLanguageAndThemeRegistered?: boolean;
};

export function registerPyTamaroLanguageAndTheme(monaco: MonacoForPyTamaro) {
  if (monaco._pytamaroLanguageAndThemeRegistered) {
    return;
  }
  registerCustomPythonLanguage(monaco);
  monaco.editor.defineTheme(LUCE_THEME_NAME, LUCE_THEME);
  monaco.editor.setTheme(LUCE_THEME_NAME);
  // eslint-disable-next-line no-param-reassign
  monaco._pytamaroLanguageAndThemeRegistered = true;
}
