// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Message
} from 'phosphor/lib/core/messaging';

import {
  ResizeMessage, Widget
} from 'phosphor/lib/ui/widget';

import {
  CodeEditor
} from './';


/**
 * A widget which hosts a code editor.
 */
export
class CodeEditorWidget extends Widget {
  /**
   * Construct a new code editor widget.
   */
  constructor(options: CodeEditorWidget.IOptions) {
    super();
    this._editor = options.factory({ host: this.node, model: options.model });
  }

  /**
   * Get the editor wrapped by the widget.
   */
  get editor(): CodeEditor.IEditor {
    return this._editor;
  }

  /**
   * Get the model used by the widget.
   */
  get model(): CodeEditor.IModel {
    return this._editor.model;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose() {
    if (this.isDisposed) {
      return;
    }
    clearTimeout(this._resizing);
    super.dispose();
    this._editor.dispose();
    this._editor = null;
  }

  /**
   * Handle `'activate-request'` messages.
   */
  protected onActivateRequest(msg: Message): void {
    this._editor.focus();
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.node.addEventListener('focus', this, true);
    if (!this.isVisible) {
      this._needsRefresh = true;
      return;
    }
    this._editor.refresh();
    this._needsRefresh = false;
  }

  /**
   * Handle `before_detach` messages for the widget.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('focus', this, true);
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    if (this._needsRefresh) {
      this._editor.refresh();
      this._needsRefresh = false;
    }
  }

  /**
   * A message handler invoked on an `'resize'` message.
   */
  protected onResize(msg: ResizeMessage): void {
    if (msg.width < 0 || msg.height < 0) {
      if (this._resizing === -1) {
        this._editor.setSize(null);
        this._resizing = setTimeout(() => {
          if (this._needsResize) {
            this._editor.setSize(null);
            this._needsResize = false;
          }
          this._resizing = -1;
        }, 500);
      } else {
        this._needsResize = true;
      }
    } else {
      this._editor.setSize(msg);
    }
    this._needsRefresh = true;
  }

  /**
   * Handle the DOM events for the widget.
   *
   * @param event - The DOM event sent to the widget.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the panel's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'focus':
      this._evtFocus(event as FocusEvent);
      break;
    default:
      break;
    }
  }

  /**
   * Handle `focus` events for the widget.
   */
  private _evtFocus(event: FocusEvent): void {
    if (this._needsRefresh) {
      this._editor.refresh();
      this._needsRefresh = false;
    }
  }

  private _editor: CodeEditor.IEditor = null;
  private _needsRefresh = true;
  private _needsResize = false;
  private _resizing = -1;
}


/**
 * The namespace for the `CodeEditorWidget` statics.
 */
export
namespace CodeEditorWidget {
  /**
   * The options used to initialize a code editor widget.
   */
  export
  interface IOptions {
    /**
     * A code editor factory.
     *
     * #### Notes
     * The widget needs a factory and a model instead of a `CodeEditor.IEditor`
     * object because it needs to provide its own node as the host.
     */
    factory: CodeEditor.Factory;

    /**
     * The model used to initialize the code editor.
     */
    model: CodeEditor.IModel;
  }
}
