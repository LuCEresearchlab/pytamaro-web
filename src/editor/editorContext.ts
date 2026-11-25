import type { Monaco } from '@monaco-editor/react';
import type { editor, IRange, Position } from 'monaco-editor';
import type { LiveAnalysisStatus } from '../localStorage/schema';
import type { PythonName } from '../python-analyzer/python_analyzer';
import type { CustomDiagnostic } from './diagnostics';

/**
 * The document-specific operations that `CodeEditor` needs.
 *
 * `CodeEditor` is shared by notebook cells and by the IDE's files: it should
 * not know whether the model it edits is a cell or a whole file. Sessions
 * (`ActivitySession`, `EditorSession`) provide the adapter through
 * `createEditorContext`.
 */
export interface EditorContext {
  /** The text the editor should show when it is (re)set. */
  initialSource(): string;
  /** The current text of the document. */
  currentSource(): string;
  /** Binds a Monaco model to the underlying session. */
  attachModel(model: editor.ITextModel): void;
  /** Unbinds a Monaco model from the underlying session. */
  detachModel(model: editor.ITextModel): void;
  /** Pushes an edit into the underlying session. */
  updateSource(source: string): void;
  /**
   * Whether a model change is currently caused by the session (storage, another
   * tab, reset) rather than by the user. Such changes must not be written back.
   */
  isApplyingExternalUpdate?(): boolean;
  /** Replaces a model's text without treating it as a user edit. */
  applyModelText?(model: editor.ITextModel, text: string): void;
  /** Diagnostics for this document, with ranges relative to the model. */
  diagnostics(liveAnalysis: LiveAnalysisStatus): CustomDiagnostic[];
  /** The Python name under the cursor, if it can be resolved. */
  hoveredPythonName(
    model: editor.ITextModel,
    position: Position,
  ): PythonName | null;
  /** Subscribes to re-analysis; returns an unsubscribe function. */
  subscribeToAnalysis(listener: () => void): () => void;
  /** Optional range of the last expression (eval-last-expression mode). */
  evalExprRange?(
    monaco: Monaco,
    editor: editor.IStandaloneCodeEditor,
  ): IRange | null;
  /** Name of the file this document runs as; omitted for notebook cells. */
  runtimeFileName?: string;
}
