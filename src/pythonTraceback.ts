import { Monaco } from '@monaco-editor/react';
import { type editor as EditorNamespace } from 'monaco-editor';
import { CompletedExecutionResponse } from './codeExecution';
import { splitLines } from './sourceUtils';

export function addMarkers(
  monaco: Monaco,
  editor: EditorNamespace.IStandaloneCodeEditor,
  executionResponse: CompletedExecutionResponse,
  firstLineNumber: number,
  collapsedErrorMarkers: boolean,
): boolean {
  const traceback = executionResponse.stderr;
  const tracebackLines = splitLines(traceback);
  const regex = / {2}File "\/home\/glot\/cell.py", line (\d+)/;
  const lineWithErrorLine = tracebackLines.findLastIndex((line) =>
    regex.test(line),
  );
  const model = editor.getModel();
  if (model && lineWithErrorLine !== -1) {
    // Extract the relevant line number
    const relevantLine = tracebackLines[lineWithErrorLine];
    const lineNumber = parseInt(relevantLine.match(regex)![1], 10);
    const currentCellLineIdx = lineNumber - firstLineNumber + 1;
    // Extract the caret position from two lines after, if available
    const caretData =
      tracebackLines[lineWithErrorLine + 2]?.match(/ {4}(.*)/)?.[1];
    const validCaret = Array.from(caretData || '').every(
      (c) => c === ' ' || c === '^',
    );
    const defaultBegin = 0;
    const defaultEnd = 1000;
    const caretBegin = validCaret
      ? caretData?.indexOf('^') || defaultBegin
      : defaultBegin;
    const caretEnd = validCaret
      ? caretData?.lastIndexOf('^') || defaultEnd
      : defaultEnd;
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
    monaco.editor.setModelMarkers(model, 'owner', [marker]);
    if (!collapsedErrorMarkers) {
      editor.trigger('', 'editor.action.marker.next', {});
    }
    return true;
  }
  return false;
}

export function processTraceback(content: string) {
  // Hide the "driver" file.
  const hideDriver = (s: string) =>
    s.replace(
      /\n {2}File "\/home\/glot\/driver.py", line \d+, in <module>\n.*\n/g,
      '\n',
    );
  const contentLines = splitLines(hideDriver(content));
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
  const regex = / {2}File "\/home\/glot\/toolbox_(.*).py", line (\d+), in \1/;
  return splitLines(content).some((line) => regex.test(line));
}
