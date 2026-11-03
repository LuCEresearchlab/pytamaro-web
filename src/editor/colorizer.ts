import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import {
  configureEditor,
  LUCE_THEME_NAME,
  MonacoForPyTamaro,
  registerPyTamaroLanguageAndTheme,
} from './utils';

export const COLORIZE_CLASSNAME = 'monaco-colorize';

configureEditor();

export default function useMonacoColorizer() {
  const monaco = useMonaco() as MonacoForPyTamaro | null;
  useEffect(() => {
    if (monaco) {
      registerPyTamaroLanguageAndTheme(monaco);
      document
        .querySelectorAll<HTMLElement>(
          // colorizeElement() adds the current theme as a class and doesn't deal well with colorizing multiple times.
          // We therefore exclude elements that have already been colorized with our custom theme.
          `.${COLORIZE_CLASSNAME}:not(.vs, .${LUCE_THEME_NAME})`,
        )
        .forEach((element) => {
          monaco.editor.colorizeElement(element, {
            theme: LUCE_THEME_NAME,
          });
        });
    }
  }, [monaco]);
}
