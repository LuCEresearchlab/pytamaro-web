import { Monaco } from '@monaco-editor/react';
import type {
  editor as EditorNamespace,
  IPosition,
  IRange,
} from 'monaco-editor';
import { TFunction } from 'next-i18next';
import { ERROR_MESSAGE_CLASSNAME } from '../../components/input_output/OutputArea';
import { convertMarkdownCodeTagsToHTML } from '../basicMarkdown';
import theme from '../theme';
import { displayErrorCategory, ErrorCategory, simplifyTypes } from './errors';

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
  private readonly _prefixNode: HTMLSpanElement | null;
  private readonly _arrowNode: HTMLDivElement;
  private readonly _isRuntimeError: boolean;

  constructor(
    monaco: Monaco,
    editor: EditorNamespace.ICodeEditor,
    range: IRange,
    content: string,
    isRuntimeError: boolean,
    category: ErrorCategory,
    t: TFunction,
    onClose?: () => void,
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
    this._domNode.style.marginLeft = '-6px';
    this._domNode.style.zIndex = '1000';

    const message = document.createElement('div');
    message.style.width = 'max-content';
    message.style.maxWidth = 'min(90vw, 100ch)';
    message.style.display = 'flex';
    message.style.alignItems = 'stretch';
    message.style.backgroundColor = theme.palette.error.main;
    message.style.color = theme.palette.error.contrastText;
    message.style.borderRadius = '3px';
    message.style.boxShadow = theme.shadows[1];
    message.style.fontFamily = theme.typography.fontFamily as string;
    message.style.fontSize = theme.typography.body1.fontSize as string;

    const prefixNode = document.createElement('span');
    prefixNode.style.display = 'flex';
    prefixNode.style.alignItems = 'center';
    prefixNode.style.borderTopLeftRadius = '3px';
    prefixNode.style.borderBottomLeftRadius = '3px';
    prefixNode.style.paddingTop = '2px';
    prefixNode.style.paddingBottom = '2px';
    prefixNode.style.paddingLeft = '10px';
    prefixNode.style.backgroundColor = theme.palette.error.dark;
    if (isRuntimeError) {
      const runtimeIcon = document.createElement('span');
      runtimeIcon.style.verticalAlign = 'bottom';
      runtimeIcon.style.fontFamily = 'Material Icons';
      runtimeIcon.textContent = 'electric_bolt';
      runtimeIcon.style.marginRight = '4px';
      prefixNode.appendChild(runtimeIcon);
    }
    const categoryContent = displayErrorCategory(category, t);
    const categorySpan = document.createElement('span');
    categorySpan.style.paddingRight = '10px';
    categorySpan.style.fontWeight = 'bold';
    categorySpan.textContent = categoryContent;
    prefixNode.appendChild(categorySpan);
    this._prefixNode = prefixNode;
    message.appendChild(prefixNode);

    const messageContent = document.createElement('span');
    messageContent.style.paddingLeft = '12px';
    messageContent.style.paddingRight = '12px';
    messageContent.style.paddingTop = '2px';
    messageContent.style.paddingBottom = '2px';
    messageContent.innerHTML = convertMarkdownCodeTagsToHTML(
      simplifyTypes(content),
    );
    if (isRuntimeError) {
      messageContent.onmouseover = () => this.highlightCorrespondingError(true);
      messageContent.onmouseout = () => this.highlightCorrespondingError(false);
    }
    message.appendChild(messageContent);

    if (isRuntimeError) {
      const closeIcon = document.createElement('span');
      closeIcon.dataset.testid = 'dismiss-runtime-error';
      closeIcon.style.fontFamily = 'Material Icons';
      closeIcon.style.paddingRight = '4px';
      closeIcon.style.display = 'flex';
      closeIcon.style.alignItems = 'center';
      closeIcon.textContent = 'cancel';
      closeIcon.style.cursor = 'pointer';
      closeIcon.style.color = theme.palette.error.contrastText;
      closeIcon.onclick = onClose || (() => {});
      message.appendChild(closeIcon);
    }

    this._domNode.appendChild(message);

    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.border = '8px solid transparent';
    arrow.style.borderTopColor = theme.palette.error.main;
    this._domNode.appendChild(arrow);
    this._arrowNode = arrow;

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

  afterRender() {
    const prefixWidthWithPadding = (this._prefixNode?.offsetWidth ?? 0) + 8;
    this._domNode.style.marginLeft = `-${6 + prefixWidthWithPadding}px`; // 6px is the default from Monaco
    this._arrowNode.style.left = `${prefixWidthWithPadding}px`;
  }
}
