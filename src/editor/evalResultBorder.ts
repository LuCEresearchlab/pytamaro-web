import type { editor, IDisposable, IRange } from 'monaco-editor';

export const EVAL_RESULT_BORDER_CLASSNAME = 'eval-result-code-border';

const PADDING_X = 1;
const PADDING_Y = 1;

/**
 * Draws a single dashed border around a (possibly multi-line) range.
 *
 * Monaco splits inline decorations per line, so a CSS border on a decoration
 * would produce one box per line. This uses one overlay element instead.
 */
export class EvalResultBorder {
  private readonly _editor: editor.IStandaloneCodeEditor;
  private readonly _domNode: HTMLDivElement;
  private readonly _disposables: IDisposable[] = [];
  private _range: IRange | null = null;

  constructor(editorInstance: editor.IStandaloneCodeEditor) {
    this._editor = editorInstance;

    this._domNode = document.createElement('div');
    this._domNode.className = EVAL_RESULT_BORDER_CLASSNAME;
    this._domNode.style.display = 'none';
    // `getDomNode` is the `.monaco-editor` root that the positions returned by
    // `getScrolledVisiblePosition` are relative to.
    const host =
      editorInstance.getDomNode() ??
      editorInstance.getContainerDomNode().querySelector('.monaco-editor');
    host?.appendChild(this._domNode);

    this._disposables.push(
      editorInstance.onDidScrollChange(() => this.update()),
      editorInstance.onDidLayoutChange(() => this.update()),
      editorInstance.onDidChangeConfiguration(() => this.update()),
      editorInstance.onDidChangeModel(() => this.update()),
      editorInstance.onDidChangeModelContent(() => this.update()),
    );
  }

  setRange(range: IRange | null) {
    this._range = range;
    this.update();
  }

  dispose() {
    this._domNode.remove();
    this._disposables.forEach((disposable) => disposable.dispose());
  }

  private update() {
    const model = this._editor.getModel();
    const range = this._range;
    if (model === null || range === null) {
      this._domNode.style.display = 'none';
      return;
    }

    const lineCount = model.getLineCount();
    const startLine = Math.min(Math.max(range.startLineNumber, 1), lineCount);
    const endLine = Math.min(
      Math.max(range.endLineNumber, startLine),
      lineCount,
    );

    let top = Number.POSITIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;
    let left = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;

    for (let line = startLine; line <= endLine; line += 1) {
      const maxColumn = model.getLineMaxColumn(line);
      const startColumn =
        line === startLine
          ? Math.min(Math.max(range.startColumn, 1), maxColumn)
          : 1;
      const endColumn =
        line === endLine
          ? Math.min(Math.max(range.endColumn, 1), maxColumn)
          : maxColumn;

      const startPosition = this._editor.getScrolledVisiblePosition({
        lineNumber: line,
        column: startColumn,
      });
      const endPosition = this._editor.getScrolledVisiblePosition({
        lineNumber: line,
        column: endColumn,
      });

      if (startPosition === null || endPosition === null) {
        this._domNode.style.display = 'none';
        return;
      }

      top = Math.min(top, startPosition.top);
      bottom = Math.max(bottom, startPosition.top + startPosition.height);
      left = Math.min(left, startPosition.left);
      right = Math.max(right, endPosition.left);
    }

    this._domNode.style.left = `${left - PADDING_X}px`;
    this._domNode.style.top = `${top - PADDING_Y}px`;
    this._domNode.style.width = `${Math.max(right - left, 0) + 2 * PADDING_X}px`;
    this._domNode.style.height = `${bottom - top + 2 * PADDING_Y}px`;
    this._domNode.style.display = 'block';
  }
}
