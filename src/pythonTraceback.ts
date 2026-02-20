import { Monaco } from '@monaco-editor/react';
import { type editor as EditorNamespace } from 'monaco-editor';
import { TFunction } from 'next-i18next';
import { ErrorMessageWidget } from '../components/editor/ErrorMessageWidget';
import { runtimeErrorMessageCategory } from '../components/editor/errors';
import { ExecutionResponse } from './codeExecution';
import { splitLines } from './sourceUtils';

export const TRACEBACK_TILDE_DECORATION_CLASSNAME =
  'squiggly-warning traceback-tilde';

export const TRACEBACK_MESSAGE_DECORATION_CLASSNAME =
  'squiggly-error traceback-message';

const LIBRARY_PATH = '/lib/';

function nicerTraceback(traceback: string) {
  // Remove PythonError: at the beginning
  const removePythonErrorColon = (s: string) => {
    const lines = s.split('\n');
    lines[0] = lines[0].replace(/^PythonError: /, '');
    return lines.join('\n');
  };

  // Hide the "driver" file.
  const hideDriver = (s: string) =>
    // Remove the line with the driver file, the one after it (source code),
    // and possibly even the one after if it has only the caret.
    s.replace(
      /^ {2}File "driver.py", line \d+, in \S+\n.*\n(?:\s*~+\^+\s*\n)?/gm,
      '',
    );

  // Hide /lib/python*/_pyodide/_base.py
  const hidePyodideBase = (s: string) =>
    // Remove the line with the driver file, the one after it (source code),
    // and possibly even the one after if it has only the caret.
    s.replace(
      /^ {2}File "\/lib\/python\d+\.zip\/_pyodide\/_base.py", line \d+, in \S+\n.*\n(?:\s*~+\^+\s*\n)?/gm,
      '',
    );

  const hideGlotBase = (s: string) =>
    s.replace(
      /^ {2}File "\/home\/glot\/driver.py", line \d+, in \S+\n.*\n(?:\s*~+\^+\s*\n)?/gm,
      '',
    );

  // Hide pyodide run folder
  const hidePyodideRunFolder = (s: string) =>
    s.replace(/\/run\/py\/(.*)/g, '$1');

  // Shorten library paths
  const shortenLibraryPaths = (s: string) =>
    s.replaceAll('/lib/python3.13/site-packages/', LIBRARY_PATH);

  const shortenGlotLibraryPaths = (s: string) =>
    s.replaceAll('/usr/local/lib/', LIBRARY_PATH);

  // Replace the word ellipsis within backticks or quotes with three dots,
  // to avoid confusion with the ellipse function and to match the source code.
  const replaceEllipsis = (s: string) =>
    s.replace(/`ellipsis`/g, '`...`').replace(/'ellipsis'/g, "'...'");

  return [
    removePythonErrorColon,
    hideDriver,
    hideGlotBase,
    hidePyodideBase,
    hidePyodideRunFolder,
    shortenLibraryPaths,
    shortenGlotLibraryPaths,
    replaceEllipsis,
  ].reduce((acc, fn) => fn(acc), traceback);
}

function lineNumOfErrorThisCell(
  traceback: string[],
  firstLineNumberOfThisCell: number,
) {
  const regex = / {2}File "cell_\d+.py", line (\d+)/;
  const idxInTraceback = traceback.findLastIndex((line) => regex.test(line));
  if (idxInTraceback === -1) {
    return undefined;
  }
  const lineNum = parseInt(traceback[idxInTraceback].match(regex)![1], 10);
  if (lineNum < firstLineNumberOfThisCell) {
    return undefined;
  }
  return { idxInTraceback, lineNum };
}

function simulateModelChange(
  monaco: Monaco,
  model: EditorNamespace.ITextModel,
) {
  // We need a "real" change, otherwise Monaco will "optimize it away".
  // However, we want to avoid using the drastic `editor.setValue(editor.getValue())`,
  // because it forces a re-tokenization, causing visual glitches (e.g., highlighting, scrollbars).

  // Alternative: add a space at the end, then remove it.
  const lastPos = model.getFullModelRange().getEndPosition();
  const lastRange = monaco.Range.fromPositions(lastPos, lastPos);
  model.applyEdits([
    {
      range: lastRange,
      text: ' ',
    },
  ]);
  // Remove the space we just added (but as a separate edit, to ensure it is applied after the previous edit).
  const newLastPos = model.getFullModelRange().getEndPosition();
  const newLastRange = monaco.Range.fromPositions(lastPos, newLastPos);
  model.applyEdits([
    {
      range: newLastRange,
      text: '',
    },
  ]);
}

/**
 * Adds error annotations as decorations and a content widget.
 * This function already adds the decorations and the widget to the editor.
 */
export function addErrorAnnotationsFromExecution(
  monaco: Monaco,
  editor: EditorNamespace.IStandaloneCodeEditor,
  executionResponse: ExecutionResponse,
  firstLineNumber: number,
  t: TFunction,
): {
  widget: ErrorMessageWidget;
  decorationsCollection: EditorNamespace.IEditorDecorationsCollection;
} | null {
  const traceback = nicerTraceback(executionResponse.stderr);
  const tracebackLines = splitLines(traceback);
  const lineNumberInfo = lineNumOfErrorThisCell(
    tracebackLines,
    firstLineNumber,
  );
  const model = editor.getModel();
  if (!model || lineNumberInfo === undefined) {
    return null;
  }
  // Extract the relevant line number
  const currentCellLineIdx = lineNumberInfo.lineNum - firstLineNumber + 1;
  // Find that line in the editor, count number of leading spaces
  const sourceLineContent = model.getLinesContent()[currentCellLineIdx - 1];
  const leadingSpaces =
    sourceLineContent.length - sourceLineContent.trimStart().length;
  // Extract the caret position from two lines after, if available
  const caretData =
    tracebackLines[lineNumberInfo.idxInTraceback + 2]?.match(/ {4}(.*)/)?.[1];
  const validCaret =
    caretData !== undefined &&
    Array.from(caretData).every((c) => c === ' ' || c === '^' || c === '~');
  // Create a widget for the ^^^ part
  const firstCaret = validCaret ? caretData.indexOf('^') : undefined;
  const lastCaret = validCaret ? caretData.lastIndexOf('^') : undefined;
  const caretBegin =
    firstCaret !== undefined && firstCaret != -1
      ? firstCaret + leadingSpaces
      : leadingSpaces;
  const caretEnd =
    lastCaret !== undefined && lastCaret != -1
      ? lastCaret + leadingSpaces
      : sourceLineContent.length - 1;
  // Extract the error message
  const errorMessage = Array.from(
    traceback.matchAll(/^(?: {2}.*\n)+(.*)\n?/gm),
  ).pop();
  const message = errorMessage?.at(1) || 'Error (check the traceback)';
  const lineNumber = currentCellLineIdx;
  const startColumn = caretBegin + 1;
  const endColumn = caretEnd + 2;
  const mainDecoration = {
    range: new monaco.Range(lineNumber, startColumn, lineNumber, endColumn),
    options: {
      className: TRACEBACK_MESSAGE_DECORATION_CLASSNAME,
      showIfCollapsed: true,
    },
  };
  // Create decorations for each possible ~~~ chunk.
  const decorations = Array.from((caretData || '').matchAll(/~+/g)).map(
    (match) => {
      const begin = match.index;
      const end = begin + match[0].length;
      return {
        range: new monaco.Range(
          lineNumber,
          begin + leadingSpaces + 1,
          lineNumber,
          end + leadingSpaces + 1,
        ),
        options: {
          className: TRACEBACK_TILDE_DECORATION_CLASSNAME,
        },
      };
    },
  );
  const decorationsCollection = editor.createDecorationsCollection([
    mainDecoration,
    ...decorations,
  ]);
  const widget = new ErrorMessageWidget(
    monaco,
    editor,
    mainDecoration.range,
    message,
    true,
    runtimeErrorMessageCategory(message),
    t,
    () => {
      // On close, *simulate a model change* so that
      // (1) runtime annotations (decorations + widget) are removed
      // (2) static analysis is re-run, possibly adding diagnostics
      // (3) the execution response is marked as not synced and becomes grayed out
      const model = editor.getModel();
      if (!model) {
        return;
      }
      simulateModelChange(monaco, model);
    },
  );
  return {
    widget,
    decorationsCollection,
  };
}

function stderrLines(content: string) {
  return splitLines(nicerTraceback(content));
}

export function processTraceback(content: string) {
  const contentLines = stderrLines(content);
  // Find the last part in the traceback, after the indented stack frames, that
  // contains the error.
  const startErrorLine = contentLines.findLastIndex(
    (line, idx) =>
      idx > 0 && contentLines[idx - 1].startsWith('  ') && /.*:.*/g.test(line),
  );
  const errorLines = contentLines.slice(startErrorLine);
  const tracebackLines = contentLines.slice(0, startErrorLine);
  // The first part (stack frames) can be divided in two: frames from "user code" (to be shown)
  // and frames from "libraries" that can be collapsed.
  const firstLibraryLine = tracebackLines.findIndex((line) =>
    line.startsWith('  File "' + LIBRARY_PATH),
  );
  const collapsed = firstLibraryLine !== -1;
  const userTracebackLines = collapsed
    ? tracebackLines.slice(0, firstLibraryLine)
    : tracebackLines;
  const libraryTracebackLines = tracebackLines.slice(firstLibraryLine);
  return {
    errorLines,
    userTracebackLines,
    libraryTracebackLines,
    collapsed,
  };
}

export function isErrorInvolvingToolbox(content: string) {
  const regex = / {2}File "toolbox_(.*).py", line (\d+)/;
  return stderrLines(content).some((line) => regex.test(line));
}

export function isErrorPreviousCells(content: string, firstLineNumber: number) {
  return (
    lineNumOfErrorThisCell(stderrLines(content), firstLineNumber) === undefined
  );
}
