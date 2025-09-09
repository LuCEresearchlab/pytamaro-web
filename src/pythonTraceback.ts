import { Monaco } from '@monaco-editor/react';
import { type editor as EditorNamespace } from 'monaco-editor';
import { CompletedExecutionResponse } from './codeExecution';
import { splitLines } from './sourceUtils';

export const TRACEBACK_TIDLE_DECORATION_CLASSNAME =
  'squiggly-warning traceback-tilde';

function nicerTraceback(traceback: string) {
  // Hide the "driver" file.
  const hideDriver = (s: string) =>
    // Remove the line with the driver file, the one after it (source code),
    // and possibly even the one after if it has only the caret.
    s.replace(
      /^ {2}File "\/home\/glot\/driver.py", line \d+, in \S+\n.*\n(?:\s*~+\^+\s*\n)?/gm,
      '',
    );

  // Hide 'glot' in source paths
  const hideGlot = (s: string) => s.replace(/File "\/home\/glot\//g, 'File "');

  // Replace the word ellipsis within backticks or quotes with three dots,
  // to avoid confusion with the ellipse function and to match the source code.
  const replaceEllipsis = (s: string) =>
    s.replace(/`ellipsis`/g, '`...`').replace(/'ellipsis'/g, "'...'");

  return replaceEllipsis(hideGlot(hideDriver(traceback)));
}

function lineNumOfErrorThisCell(traceback: string[]) {
  const regex = / {2}File "cell.py", line (\d+)/;
  const idxTracebackLine = traceback.findLastIndex((line) => regex.test(line));
  return idxTracebackLine !== -1
    ? {
        idxInTraceback: idxTracebackLine,
        lineNum: parseInt(traceback[idxTracebackLine].match(regex)![1], 10),
      }
    : undefined;
}

export function addMarkers(
  monaco: Monaco,
  editor: EditorNamespace.IStandaloneCodeEditor,
  executionResponse: CompletedExecutionResponse,
  firstLineNumber: number,
): boolean {
  const traceback = nicerTraceback(executionResponse.stderr);
  const tracebackLines = splitLines(traceback);
  const lineNumberInfo = lineNumOfErrorThisCell(tracebackLines);
  const model = editor.getModel();
  if (model && lineNumberInfo !== undefined) {
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
    // Create a marker for the ^^^ part
    const firstCaret = validCaret ? caretData.indexOf('^') : undefined;
    const lastCaret = validCaret ? caretData.lastIndexOf('^') : undefined;
    const caretBegin =
      firstCaret !== undefined && firstCaret != -1
        ? firstCaret + leadingSpaces
        : 0;
    const caretEnd =
      lastCaret !== undefined && lastCaret != -1
        ? lastCaret + leadingSpaces
        : sourceLineContent.length - 1;
    // Extract the error message
    const errorMessage = Array.from(
      traceback.matchAll(/ {2}.*\n(.*:.*)\n/g),
    ).pop();
    const marker = {
      message: errorMessage?.at(1) || 'Error (check the traceback)',
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: currentCellLineIdx,
      startColumn: caretBegin + 1,
      endLineNumber: currentCellLineIdx,
      endColumn: caretEnd + 2,
    };
    // Create decorations for each possible ~~~ chunk.
    const decorations = Array.from((caretData || '').matchAll(/~+/g)).map(
      (match) => {
        const begin = match.index;
        const end = begin + match[0].length;
        return {
          range: new monaco.Range(
            currentCellLineIdx,
            begin + leadingSpaces + 1,
            currentCellLineIdx,
            end + leadingSpaces + 1,
          ),
          options: {
            className: TRACEBACK_TIDLE_DECORATION_CLASSNAME,
          },
        };
      },
    );
    editor.createDecorationsCollection(decorations);
    monaco.editor.setModelMarkers(model, 'owner', [marker]);
    return true;
  }
  return false;
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
  // and frames from "libraries" (files in /usr) that can be collapsed.
  const firstLibraryLine = tracebackLines.findIndex((line) =>
    line.startsWith('  File "/usr'),
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

export function isErrorPreviousCells(content: string) {
  return lineNumOfErrorThisCell(stderrLines(content)) === undefined;
}
