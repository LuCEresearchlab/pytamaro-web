import { Monaco } from '@monaco-editor/react';
import type {
  editor as EditorNamespace,
  IPosition,
  IRange,
} from 'monaco-editor';
import theme from '../../src/theme';
import { ERROR_MESSAGE_CLASSNAME } from '../OutputArea';
import {
  convertMarkdownToCodeTag,
  displayErrorCategory,
  ErrorCategory,
  removeRedundantCategory,
  simplifyTypes,
} from './errors';

const STATIC_ERROR_MESSAGE_ID = 'static-error-message-widget';
const RUNTIME_ERROR_MESSAGE_ID = 'runtime-error-message-widget';

/**
 * Tooltip-like content widget, adapted from the `MessageWidget` class in
 * https://github.com/microsoft/vscode/blob/c51ec27b9b06377ccd9916ea692d0e175857ae8d/src/vs/editor/contrib/message/browser/messageController.ts
 */
export class ErrorMessageWidget implements EditorNamespace.IContentWidget {
  readonly allowEditorOverflow = true;
  readonly suppressMouseDown = false;

  private readonly _monaco: Monaco;
  private readonly _editor: EditorNamespace.ICodeEditor;
  private readonly _position: IPosition;
  private readonly _domNode: HTMLDivElement;
  private readonly _isRuntimeError: boolean;

  constructor(
    monaco: Monaco,
    editor: EditorNamespace.ICodeEditor,
    range: IRange,
    content: string,
    isRuntimeError: boolean,
    category: ErrorCategory,
  ) {
    this._monaco = monaco;
    this._editor = editor;
    this._position = {
      lineNumber: range.startLineNumber,
      column: range.startColumn,
    };
    this._isRuntimeError = isRuntimeError;
    this._editor.revealPositionInCenterIfOutsideViewport(
      this._position,
      monaco.editor.ScrollType.Smooth,
    );

    this._domNode = document.createElement('div');
    this._domNode.classList.add('monaco-editor-overlaymessage');
    this._domNode.style.marginLeft = '-30px';
    this._domNode.style.zIndex = '1000';

    if (isRuntimeError) {
      const closeIcon = document.createElement('div');
      closeIcon.style.fontFamily = 'Material Icons';
      closeIcon.textContent = 'cancel';
      closeIcon.style.position = 'absolute';
      closeIcon.style.top = '-3px';
      closeIcon.style.right = '1px';
      closeIcon.style.cursor = 'pointer';
      closeIcon.style.color = theme.palette.error.contrastText;
      closeIcon.onclick = () => {
        this.dispose();
      };
      this._domNode.appendChild(closeIcon);
    }

    const anchorTop = document.createElement('div');
    anchorTop.classList.add('anchor', 'top');
    anchorTop.style.borderBottomColor = theme.palette.error.main;
    anchorTop.style.left = '26px';
    this._domNode.appendChild(anchorTop);

    const message = document.createElement('div');
    message.style.width = 'max-content';
    message.style.maxWidth = 'min(90vw, 100ch)';
    message.style.paddingTop = '2px';
    message.style.paddingRight = `${isRuntimeError ? 24 : 12}px`;
    message.style.paddingBottom = '2px';
    message.style.paddingLeft = '12px';
    message.style.backgroundColor = theme.palette.error.main;
    message.style.color = theme.palette.error.contrastText;
    message.style.borderRadius = '3px';
    message.style.boxShadow = theme.shadows[1];
    message.style.fontFamily = theme.typography.fontFamily as string;
    message.style.fontSize = theme.typography.body1.fontSize as string;

    const categoryContent = displayErrorCategory(category);
    if (categoryContent !== '') {
      const categorySpan = document.createElement('span');
      categorySpan.style.marginRight = '12px';
      categorySpan.style.fontWeight = 'bold';
      categorySpan.style.opacity = '0.7';
      categorySpan.textContent = categoryContent;
      message.appendChild(categorySpan);
    }

    const messageContent = document.createElement('span');
    messageContent.innerHTML = convertMarkdownToCodeTag(
      removeRedundantCategory(simplifyTypes(content)),
    );
    message.appendChild(messageContent);

    if (isRuntimeError) {
      message.onmouseover = () => this.highlightCorrespondingError(true);
      message.onmouseout = () => this.highlightCorrespondingError(false);
    }

    this._domNode.appendChild(message);

    const anchorBottom = document.createElement('div');
    anchorBottom.classList.add('anchor', 'below');
    anchorBottom.style.borderTopColor = theme.palette.error.main;
    anchorBottom.style.left = '26px';
    this._domNode.appendChild(anchorBottom);

    this._editor.addContentWidget(this);
  }

  getId(): string {
    return this._isRuntimeError
      ? RUNTIME_ERROR_MESSAGE_ID
      : STATIC_ERROR_MESSAGE_ID;
  }

  getDomNode(): HTMLElement {
    return this._domNode;
  }

  highlightCorrespondingError(on: boolean) {
    document
      .querySelector(`.${ERROR_MESSAGE_CLASSNAME}`)
      ?.classList.toggle('hover', on);
  }

  dispose() {
    if (this._isRuntimeError) {
      this.highlightCorrespondingError(false);
    }
    this._editor.removeContentWidget(this);
  }

  getPosition(): EditorNamespace.IContentWidgetPosition {
    return {
      position: this._position,
      preference: [this._monaco.editor.ContentWidgetPositionPreference.ABOVE],
    };
  }

  afterRender(
    position: EditorNamespace.ContentWidgetPositionPreference | null,
  ): void {
    this._domNode.classList.toggle(
      'below',
      position === this._monaco.editor.ContentWidgetPositionPreference.BELOW,
    );
  }
}
