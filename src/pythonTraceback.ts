import { Monaco } from '@monaco-editor/react';
import { IRange, type editor as EditorNamespace } from 'monaco-editor';
import { TFunction } from 'next-i18next';
import { ErrorMessageWidget } from '../components/editor/ErrorMessageWidget';
import { runtimeErrorMessageCategory } from '../components/editor/errors';
import { ExecutionResponse } from './execution/codeExecution';
import { PYTHON_VERSION } from './execution/versions';
import {
  splitLines,
  splitLinesWithoutPossibleTrailingNewline,
} from './sourceUtils';

export const TRACEBACK_TILDE_DECORATION_CLASSNAME =
  'squiggly-warning traceback-tilde';

export const TRACEBACK_MESSAGE_DECORATION_CLASSNAME =
  'squiggly-error traceback-message';

const LIBRARY_PATH = '/lib/';

const REGEX_TRACEBACK_CELL_FILE_LINE = / {2}File "cell_\d+\.py", line (\d+)/;

const REGEX_CARET_LINE = /^\s*~*\^+~*$/;

function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

function tracebackEntriesRegex(fileNamePattern: string): RegExp {
  // Real examples of different traceback entry formats that we want to capture
  //
  // - Syntax error, with carets:
  //   File "cell_0.py", line 1
  //     if True:
  //             ^
  //
  // - Single line of code, no carets:
  //   File "/lib/python313.zip/_pyodide/_base.py", line 147, in _parse_and_compile_gen
  //     source = dedent(source)
  //
  // - Runtime, with carets and tildes:
  //   File "/lib/python313.zip/_pyodide/_base.py", line 285, in __init__
  //     self.ast = next(self._gen)
  //                ~~~~^^^^^^^^^^^
  //
  // - Multiline:
  //   File "cell_0.py", line 1, in <module>
  //     i = 1 \
  //         ~~~
  //         / 0
  //         ^~~
  //
  // - Multiline, with folds
  //  File "/lib/python313.zip/_pyodide/_base.py", line 513, in eval_code
  //    CodeRunner(
  //     ~~~~~~~~~~^
  //         source,
  //         ^^^^^^^
  //     ...<5 lines>...
  //         optimize=optimize,
  //         ^^^^^^^^^^^^^^^^^^
  //     )
  //     ^
  //
  // Plain regex (with `.+\.py` as hardcoded fileNamePatter):
  // ^ {2}File ".+\.py", line \d+(?:, in \S+)?\n(?: {4}.*\n(?: {4}\s*~*\^*[ ~]*\n(?: {4}...<\d+ lines?>...\n)?)?)+

  return new RegExp(
    `^ {2}File "${fileNamePattern}", line \\d+(?:, in \\S+)?\\n(?: {4}.*\\n(?: {4}\\s*~*\\^*[ ~]*\\n(?: {4}...<\\d+ lines?>...\\n)?)?)+`,
    'gm',
  );
}

const driverPyTracebackEntriesRegex = tracebackEntriesRegex('driver\\.py');
const pyodideBaseTracebackEntriesRegex = tracebackEntriesRegex(
  '\\\/lib\\\/python\\d+\\.zip\\\/_pyodide\\\/_base\\.py',
);

function nicerTraceback(traceback: string) {
  // Remove PythonError: at the beginning
  const removePythonErrorColon = (s: string) => {
    const lines = s.split('\n');
    lines[0] = lines[0].replace(/^PythonError: /, '');
    return lines.join('\n');
  };

  // Remove the traceback entries for the driver.py file
  const hideDriver = (s: string) =>
    s.replace(driverPyTracebackEntriesRegex, '');

  // Remove the trackeback entries for the /lib/python*/_pyodide/_base.py file
  const hidePyodideBase = (s: string) =>
    s.replace(pyodideBaseTracebackEntriesRegex, '');

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
    s.replaceAll(`/lib/python${PYTHON_VERSION}/site-packages/`, LIBRARY_PATH);

  const shortenGlotLibraryPaths = (s: string) =>
    s.replaceAll('/usr/local/lib/', LIBRARY_PATH);

  // Replace the word ellipsis within backticks or quotes with three dots,
  // to avoid confusion with the ellipse function and to match the source code.
  const replaceEllipsis = (s: string) =>
    s.replace(/`ellipsis`/g, '`...`').replace(/'ellipsis'/g, "'...'");

  // Add a message to the KeyboardInterrupt error
  const addKeyboardInterruptMessage = (s: string) =>
    s.replace(/^KeyboardInterrupt$/m, 'KeyboardInterrupt: execution stopped');

  return [
    removePythonErrorColon,
    hideDriver,
    hideGlotBase,
    hidePyodideBase,
    hidePyodideRunFolder,
    shortenLibraryPaths,
    shortenGlotLibraryPaths,
    replaceEllipsis,
    addKeyboardInterruptMessage,
  ].reduce((acc, fn) => fn(acc), traceback);
}

function lineNumOfErrorThisCell(
  traceback: string[],
  firstLineNumberOfThisCell: number,
): { idxInTraceback: number; lineNum: number } | undefined {
  if (traceback.length === 0) {
    return undefined;
  }

  // We need to find the least recent occurrence of the regex where the line
  // number is ≥ firstLineNumberOfThisCell.
  const candidates = traceback
    .map((line) => {
      const match = line.match(REGEX_TRACEBACK_CELL_FILE_LINE);
      if (match === null) {
        return null;
      }
      const lineNumber = parseInt(match[1], 10);
      return lineNumber >= firstLineNumberOfThisCell ? lineNumber : null;
    })
    .map((lineNum, idxInTraceback) => {
      return lineNum === null ? undefined : { idxInTraceback, lineNum };
    })
    .filter((candidate) => candidate !== undefined);
  return candidates.length > 0 ? candidates[candidates.length - 1] : undefined;
}

function errorIsInUserCode(traceback: string[]): boolean {
  return traceback.some(
    (line) => line.match(REGEX_TRACEBACK_CELL_FILE_LINE) !== null,
  );
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
  // Ensure that the line number is still valid (the model may have changed in the meantime)
  if (currentCellLineIdx < 1 || currentCellLineIdx > model.getLineCount()) {
    return null;
  }

  // Find that line in the editor, count number of leading spaces
  const sourceLineContent = model.getLinesContent()[currentCellLineIdx - 1];
  const leadingSpaces =
    sourceLineContent.length - sourceLineContent.trimStart().length;

  // Extract the error message
  const errorMessage = Array.from(
    traceback.matchAll(/^(?: {2}.*\n)+(.*)\n?/gm),
  ).pop();
  const message = errorMessage?.at(1) || 'Error (check the traceback)';

  const tracebackFromErrorBegin: string = tracebackLines
    .slice(lineNumberInfo.idxInTraceback)
    .join('\n');

  // Parse traceback entries
  const match = tracebackFromErrorBegin.match(tracebackEntriesRegex('.+\\.py'));
  if (match === null) {
    return null;
  }

  // Skip the first line that contains `File "XX.py", line YY, in ZZ
  const tracebackEntries: string[] = splitLines(match[0]).slice(1);
  if (tracebackEntries.length === 0) {
    return null;
  }

  // How many lines of code have been folded in each line of traceback
  const lineFolds = tracebackEntries.map((line) => {
    const match = line.match(/^ {4}\.\.\.<(\d+) lines?>\.\.\.$/);
    return match === null ? 0 : parseInt(match[1], 10);
  });

  const tracebackIdxToCodeLineNumber = (idx: number): number => {
    if (idx < 0) {
      return -1;
    }
    const foldsBefore = lineFolds.slice(0, idx);
    const numFoldsBefore = foldsBefore.filter((n) => n > 0).length;
    return (
      lineNumberInfo.lineNum -
      // Lines before this cell
      firstLineNumber +
      // 1-based index in monaco
      1 +
      Math.floor((idx - numFoldsBefore) / 2) +
      sum(foldsBefore)
    );
  };

  const properlyIndentedCodeLine = (idx: number): string =>
    ' '.repeat(leadingSpaces) + tracebackEntries[idx].substring(4);

  const firstCaretLineIdx = tracebackEntries.findIndex((line) =>
    line.match(REGEX_CARET_LINE),
  );

  let caretDecoration: {
    range: IRange;
    options: {
      className: string;
      showIfCollapsed: boolean;
    };
  };
  if (firstCaretLineIdx === -1) {
    // No caret, highlight the whole line
    const lineNumber = tracebackIdxToCodeLineNumber(0);
    caretDecoration = {
      range: new monaco.Range(
        lineNumber,
        leadingSpaces,
        lineNumber,
        // + 1 for monaco range
        sourceLineContent.length + 1,
      ),
      options: {
        className: TRACEBACK_MESSAGE_DECORATION_CLASSNAME,
        showIfCollapsed: true,
      },
    };
  } else {
    // First caret position
    const firstCaretLineCode = properlyIndentedCodeLine(firstCaretLineIdx);
    const firstCaretColumn =
      1 + // 1-based index
      (firstCaretLineIdx >= 0 ? firstCaretLineCode.indexOf('^') : 0);
    const firstCaretLine = tracebackIdxToCodeLineNumber(firstCaretLineIdx);

    // Last caret position
    const lastCaretLineIdx = tracebackEntries.findLastIndex((line) =>
      line.match(REGEX_CARET_LINE),
    );
    const lastCaretLineCode = properlyIndentedCodeLine(
      lastCaretLineIdx < 0 ? firstCaretLineIdx : lastCaretLineIdx,
    );
    const lastCaretColumn =
      1 + // 1-based index
      (lastCaretLineIdx >= 0
        ? // + 1 for monaco range
          lastCaretLineCode.lastIndexOf('^') + 1
        : lastCaretLineCode.length);
    const lastCaretLine = tracebackIdxToCodeLineNumber(lastCaretLineIdx);

    caretDecoration = {
      range: new monaco.Range(
        firstCaretLine,
        firstCaretColumn,
        lastCaretLine,
        lastCaretColumn,
      ),
      options: {
        className: TRACEBACK_MESSAGE_DECORATION_CLASSNAME,
        showIfCollapsed: true,
      },
    };
  }

  const tildeDecorations = tracebackEntries.flatMap((line, idx) => {
    // Skip "line fold" lines
    if (lineFolds[idx] > 0) {
      return [];
    }
    const indentedLine = ' '.repeat(leadingSpaces) + line.substring(4);
    // Skip lines with source code
    if (indentedLine.match(/^\s*~*\^*~*$/) === null) {
      return [];
    }
    const lineNumber = tracebackIdxToCodeLineNumber(idx);
    // Find chunks of ~
    return Array.from(indentedLine.matchAll(/~+/g)).map((match) => {
      // + 1 for 1-based index
      const begin = match.index + 1;
      const end = begin + match[0].length;
      return {
        range: new monaco.Range(lineNumber, begin, lineNumber, end),
        options: {
          className: TRACEBACK_TILDE_DECORATION_CLASSNAME,
        },
      };
    });
  });

  const decorationsCollection = editor.createDecorationsCollection([
    caretDecoration,
    ...tildeDecorations,
  ]);
  const widget = new ErrorMessageWidget(
    monaco,
    editor,
    caretDecoration.range,
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
  return splitLinesWithoutPossibleTrailingNewline(nicerTraceback(content));
}

export function processTraceback(content: string) {
  const contentLines = stderrLines(content);
  // Find the last part in the traceback, after the indented stack frames, that
  // contains the error.
  const errorRegex = /.*(:.*)?/g; // exception name, followed by optional ": message"
  const startErrorLine = contentLines.findLastIndex(
    (line, idx) =>
      idx > 0 &&
      contentLines[idx - 1].startsWith('  ') &&
      errorRegex.test(line),
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
  const tracebackLines = stderrLines(content);
  return (
    errorIsInUserCode(tracebackLines) &&
    lineNumOfErrorThisCell(tracebackLines, firstLineNumber) === undefined
  );
}
