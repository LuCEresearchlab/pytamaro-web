/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNull, negate } from 'lodash';
import type {
  editor as EditorNamespace,
  IRange,
  Position,
} from 'monaco-editor';
import { TOOLBOX_FILE } from './codeExecution';
import { ToolboxFunction } from './localStorage/schema';
import PyTamaroNames from './pytamaroNames';
import { AnalysisResult, analyze } from './python-analyzer/python_analyzer';

function kind(monacoInstance: any, type: string) {
  const map: Record<string, any> = {
    function: monacoInstance.languages.CompletionItemKind.Function,
    class: monacoInstance.languages.CompletionItemKind.Class,
    value: monacoInstance.languages.CompletionItemKind.Value,
    module: monacoInstance.languages.CompletionItemKind.Module,
  };
  return map[type];
}

function currentLineText(
  model: EditorNamespace.ITextModel,
  position: Position,
): string {
  return model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  });
}

function getRangeLastWord(
  model: EditorNamespace.ITextModel,
  position: Position,
): IRange {
  const word = model.getWordUntilPosition(position);
  return {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: word.startColumn,
    endColumn: word.endColumn,
  };
}

export function toolboxImportCompletionProvider(
  monacoInstance: any,
  toolboxFunctions: ToolboxFunction[],
) {
  return {
    provideCompletionItems(
      model: EditorNamespace.ITextModel,
      position: Position,
    ) {
      const isToolboxImport = currentLineText(model, position).match(
        `from\\s+${TOOLBOX_FILE}\\s+import\\s+`,
      );
      return {
        suggestions: isToolboxImport
          ? toolboxFunctions.map((fn) => ({
              label: fn.name,
              kind: kind(monacoInstance, 'function'),
              detail: fn.description,
              insertText: fn.name,
              range: getRangeLastWord(model, position),
            }))
          : [],
      };
    },
  };
}

const PYTAMARO_MODULES: Record<string, string> = {
  // eslint-disable-next-line quote-props
  pytamaro: 'en',
  'pytamaro.it': 'it',
  'pytamaro.de': 'de',
  'pytamaro.fr': 'fr',
};

const KNOWN_MODULES = [TOOLBOX_FILE, ...Object.keys(PYTAMARO_MODULES)];

export function moduleImportCompletionProvider(monacoInstance: any) {
  return {
    provideCompletionItems(
      model: EditorNamespace.ITextModel,
      position: Position,
    ) {
      const text = currentLineText(model, position);
      const isFromImport =
        text.match('from\\s+([^\\s]+)') && !text.match('import\\s');
      return {
        suggestions: isFromImport
          ? KNOWN_MODULES.map((module) => ({
              label: module,
              kind: kind(monacoInstance, 'module'),
              insertText: module,
              range: getRangeLastWord(model, position),
            }))
          : [],
      };
    },
  };
}

export function pytamaroImportCompletionProvider(monacoInstance: any) {
  return {
    provideCompletionItems(
      model: EditorNamespace.ITextModel,
      position: Position,
    ) {
      const analysisResult: AnalysisResult = analyze(model.getValue());
      const offset = model.getOffsetAt(position);
      const importStmt = analysisResult.import_ranges.find(
        ([start, end]) => start <= offset && offset <= end,
      );
      if (!importStmt) return { suggestions: [] };
      const startPosition = model.getPositionAt(importStmt[0]);
      const endPosition = model.getPositionAt(importStmt[1]);
      const text = model.getValueInRange({
        startLineNumber: startPosition.lineNumber,
        startColumn: startPosition.column,
        endLineNumber: endPosition.lineNumber,
        endColumn: endPosition.column,
      });
      const regexes = Object.keys(PYTAMARO_MODULES).map(
        (module) => `from\\s+(${module})\\s+import\\s+`,
      );
      const pytamaroMatch = regexes
        .map((regex) => text.match(regex))
        .find(negate(isNull));
      if (!pytamaroMatch) return { suggestions: [] };
      const pytamaroModule = pytamaroMatch[1];
      const lang = PYTAMARO_MODULES[pytamaroModule];
      const prefix = `${lang}.`;
      const relevantNames = Object.entries(PyTamaroNames).filter(([name]) =>
        name.startsWith(prefix),
      );
      return {
        suggestions: relevantNames.map(([name, info]) => {
          const shortName = name.replace(prefix, '');
          return {
            label: shortName,
            kind: kind(monacoInstance, info.type),
            insertText: shortName,
            range: getRangeLastWord(model, position),
          };
        }),
      };
    },
  };
}
