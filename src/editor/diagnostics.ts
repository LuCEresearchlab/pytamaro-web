import type { editor } from 'monaco-editor';
import { LiveAnalysisStatus } from '../localStorage/schema';
import type { FileDiagnostic } from '../pythonWorkspace';
import { ErrorCategory, staticErrorMessageCategory } from './errors';

export type CustomDiagnostic = editor.IModelDeltaDecoration & {
  category: ErrorCategory;
  message: string;
};

export const ANALYZER_DIAGNOSTIC_CLASSNAME =
  'squiggly-error analyzer-diagnostic';

/**
 * Turns analyzer diagnostics into Monaco decorations.
 *
 * `previousLines` maps ranges that are relative to a file back onto a model
 * that only covers a slice of that file (e.g., a notebook cell).
 */
export function toCustomDiagnostics(
  diagnostics: readonly FileDiagnostic[],
  liveAnalysis: LiveAnalysisStatus,
  previousLines = 0,
): CustomDiagnostic[] {
  if (liveAnalysis === LiveAnalysisStatus.None) {
    return [];
  }

  const result: CustomDiagnostic[] = [];
  for (const diagnostic of diagnostics) {
    if (
      diagnostic.range === null ||
      diagnostic.range.startLineNumber <= previousLines
    ) {
      continue;
    }

    const category = staticErrorMessageCategory(diagnostic.id);
    if (
      category !== ErrorCategory.SyntaxError &&
      liveAnalysis !== LiveAnalysisStatus.SyntaxSemantics
    ) {
      continue;
    }

    result.push({
      range: {
        ...diagnostic.range,
        startLineNumber: diagnostic.range.startLineNumber - previousLines,
        endLineNumber: diagnostic.range.endLineNumber - previousLines,
      },
      options: {
        className: ANALYZER_DIAGNOSTIC_CLASSNAME,
        showIfCollapsed: true,
      },
      message: diagnostic.message,
      category,
    });
  }
  return result;
}
