import type { editor, Range } from 'monaco-editor';
import {
  onSemanticTokensChange,
  retrieveEditorSession,
  semanticTokensLegend,
} from '../editorSession';
import {
  moduleImportCompletionProvider,
  pytamaroImportCompletionProvider,
  toolboxImportCompletionProvider,
} from './completions';
import { STRICT_PYTHON3_LANG_ID } from './strictPython3';
import type { MonacoForPyTamaro } from './utils';

/**
 * Registers the language-level providers once per Monaco instance.
 * Per-editor state is found through the model's session, so the providers
 * outlive any single editor and are deliberately never disposed.
 */
export function registerCustomProviders(monaco: MonacoForPyTamaro) {
  if (monaco._pytamaroCustomProvidersRegistered === true) {
    return;
  }
  // eslint-disable-next-line no-param-reassign
  monaco._pytamaroCustomProvidersRegistered = true;

  const { languages } = monaco;
  [
    toolboxImportCompletionProvider(monaco),
    moduleImportCompletionProvider(monaco),
    pytamaroImportCompletionProvider(monaco),
  ].forEach((provider) => {
    languages.registerCompletionItemProvider(STRICT_PYTHON3_LANG_ID, provider);
  });

  const semanticTokens = (model: editor.ITextModel, range: Range) =>
    retrieveEditorSession(model)?.documentRangeSemanticTokens(model, range) ??
    null;
  languages.registerDocumentSemanticTokensProvider(STRICT_PYTHON3_LANG_ID, {
    getLegend: semanticTokensLegend,
    onDidChange: onSemanticTokensChange,
    provideDocumentSemanticTokens: (model) =>
      semanticTokens(model, model.getFullModelRange()),
    releaseDocumentSemanticTokens: () => {},
  });
  languages.registerDocumentRangeSemanticTokensProvider(
    STRICT_PYTHON3_LANG_ID,
    {
      getLegend: semanticTokensLegend,
      provideDocumentRangeSemanticTokens: semanticTokens,
    },
  );
}
