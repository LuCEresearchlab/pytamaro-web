import { debounce } from 'lodash';
import type {
  editor,
  IDisposable,
  IRange,
  languages,
  Position,
  Range,
} from 'monaco-editor';
import { toCustomDiagnostics } from './editor/diagnostics';
import type { EditorContext } from './editor/editorContext';
import { isPythonFileName } from './ideFiles';
import type { ToolboxFunction } from './localStorage/schema';
import {
  PythonName,
  SemanticToken,
  Position as TyPosition,
  Range as TyRange,
} from './python-analyzer/python_analyzer';
import type {
  AnalysisResult,
  FileDiagnostic,
  WorkspaceFile,
} from './pythonWorkspace';
import { PythonWorkspace, toMonacoRange } from './pythonWorkspace';

const editorSessionsByModel = new WeakMap<editor.ITextModel, EditorSession>();

/**
 * Returns the editor session that owns `model`, if any.
 *
 * Monaco providers are registered per language and only receive the model, so
 * they need a way to find the file/workspace it belongs to.
 */
export function retrieveEditorSession(
  model: editor.ITextModel,
): EditorSession | undefined {
  return editorSessionsByModel.get(model);
}

/**
 * Describes where a Monaco model lives inside a Python file.
 *
 * For a regular file, `previousLines` is 0. For a slice of a file (e.g., a
 * notebook cell), it is the number of lines that precede the slice inside the
 * file.
 */
export type ModelMapping = {
  file: string;
  previousLines: number;
  /**
   * The model holds only a slice of the file (e.g., a notebook cell), so the
   * text of the file must never be pushed into it.
   */
  partial?: boolean;
};

type DocumentEntry = {
  model: editor.ITextModel;
  previousLines: number;
  partial: boolean;
  contentListener: IDisposable;
  disposeListener: IDisposable;
};

/**
 * Tracks the open documents (Monaco text models) of an editing context and
 * exposes their analysis. Models are created and disposed by the editor
 * component; this class only binds them through `attachModel`.
 *
 * A document here is an open buffer (`ITextModel`), not a file: the headless
 * `PythonWorkspace` owns the files. Documents are keyed by file name, and one may
 * cover only a slice of its file (e.g., a cell, via `previousLines`). The model
 * is the source of truth while the document is open, and every content change
 * is pushed into the workspace (which owns the contents and invalidates the
 * analysis caches).
 *
 * `attachModel` lets a caller bind a model that it owns (e.g., a code cell
 * editor) to a file position. Documents can be closed and renamed through the
 * session, which keeps the workspace in sync.
 *
 * The session also exposes the multi-file workspace it is built on: callers
 * can list files, analyze them all at once, and collect diagnostics per file.
 */
export class EditorSession {
  private readonly workspace: PythonWorkspace;
  /** Analysis relative to the model's own text, instead of its whole file. */
  private analysisForModel?: (
    model: editor.ITextModel,
  ) => AnalysisResult | undefined;
  private toolboxFunctionsGetter?: () => ToolboxFunction[];
  private getModules?: () => string[];
  private documents = new Map<string, DocumentEntry>();
  private documentNames = new WeakMap<editor.ITextModel, string>();
  private editorContexts = new Map<string, EditorContext>();
  private listeners = new Set<() => void>();
  // True while we replace a model's text ourselves, so that the resulting
  // content change is not mistaken for a user edit.
  private applyingExternal = false;

  constructor(
    workspace: PythonWorkspace = new PythonWorkspace(),
    analysisForModel?: (model: editor.ITextModel) => AnalysisResult | undefined,
    toolboxFunctionsGetter?: () => ToolboxFunction[],
    getModules?: () => string[],
  ) {
    this.workspace = workspace;
    this.analysisForModel = analysisForModel;
    this.toolboxFunctionsGetter = toolboxFunctionsGetter;
    this.getModules = getModules;
  }

  /* ---------------------------------------------------------
     Files
  */

  addFiles(files: readonly WorkspaceFile[]): boolean {
    const changed = this.workspace.addFiles(files);
    if (changed) {
      this.notify();
      fireSemanticTokensChange();
    }
    return changed;
  }

  /**
   * Adds files that belong to the toolbox. They are available to the analyzer,
   * but are not part of the workspace's files.
   */
  addToolboxFiles(files: readonly WorkspaceFile[]): boolean {
    const changed = this.workspace.addToolboxFiles(files);
    if (changed) {
      this.notify();
      fireSemanticTokensChange();
    }
    return changed;
  }

  setFileContent(path: string, content: string): void {
    const changed = this.workspace.setFileContent(path, content);
    // Workspace first, so that listeners of the model see the new analysis.
    this.syncDocumentText(path, content);
    if (changed) {
      this.notify();
      fireSemanticTokensChange();
    }
  }

  /**
   * Tells the analyzer which optional libraries are installed.
   *
   * Imports of these libraries are accepted even though the analyzer cannot
   * read Pyodide's packages.
   */
  setKnownLibraries(libraries: readonly string[]): void {
    if (this.workspace.setKnownLibraries(libraries)) {
      this.notify();
      fireSemanticTokensChange();
    }
  }

  /**
   * Returns the paths of the workspace files, open or not. Toolbox files are
   * not included.
   */
  files(): readonly string[] {
    return this.workspace.files();
  }

  hasFile(path: string): boolean {
    return this.workspace.hasFile(path);
  }

  /** Subscribes to workspace changes (content, files, documents). */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Binds a model to a file (or a slice of it).
   * `onEdit` receives the model's text after each user edit; by default the
   * text is written to the file.
   */
  attachModel(
    model: editor.ITextModel,
    mapping: ModelMapping,
    onEdit?: (text: string) => void,
  ): void {
    const existingName = this.documentNames.get(model);
    if (existingName !== undefined) {
      const existing = this.documents.get(existingName);
      if (existingName === mapping.file && existing !== undefined) {
        if (existing.previousLines !== mapping.previousLines) {
          existing.previousLines = mapping.previousLines;
          // Token positions are computed with this offset.
          fireSemanticTokensChange();
        }
        return;
      }
      this.detachDocument(existingName);
    }

    this.registerDocument(model, mapping, onEdit);
  }

  detachModel(model: editor.ITextModel): void {
    const name = this.documentNames.get(model);
    if (name !== undefined) {
      this.detachDocument(name);
    }
  }

  /**
   * Replaces the text of an attached model for a reason other than a user edit
   * (storage, another tab, reset). `onEdit` is not called for it.
   */
  setModelText(model: editor.ITextModel, text: string): void {
    if (model.getValue() === text) {
      return;
    }
    this.applyingExternal = true;
    try {
      model.setValue(text);
    } finally {
      this.applyingExternal = false;
    }
  }

  /**
   * Returns the text of `name`.
   *
   * While a document is open, its model is the source of truth; otherwise the
   * text is read back from the analyzer workspace.
   */
  text(name: string): string | undefined {
    const document = this.documents.get(name);
    return document !== undefined
      ? document.model.getValue()
      : this.workspace.text(name);
  }

  /**
   * Closes the document and removes its file from the workspace.
   *
   * The model is only detached: its owner disposes it.
   */
  closeDocument(name: string): void {
    this.detachDocument(name);
    this.workspace.closeFile(name);
    this.editorContexts.delete(name);
    this.notify();
  }

  /* ---------------------------------------------------------
     Analysis
  */

  analyzeFile(path: string): AnalysisResult | undefined {
    return isPythonFileName(path)
      ? this.workspace.analyzeFile(path)
      : undefined;
  }

  diagnosticsForFile(path: string): FileDiagnostic[] {
    return isPythonFileName(path)
      ? this.workspace.diagnosticsForFile(path)
      : [];
  }

  /** The analysis of the file that `model` is a document of, if any. */
  getAnalysisResultForModel(
    model: editor.ITextModel,
  ): AnalysisResult | undefined {
    if (this.analysisForModel !== undefined) {
      return this.analysisForModel(model);
    }
    const name = this.documentNames.get(model);
    return name === undefined ? undefined : this.analyzeFile(name);
  }

  getToolboxFunctions(): ToolboxFunction[] {
    return this.toolboxFunctionsGetter?.() ?? [];
  }

  /**
   * The Python module names that can be imported from the workspace.
   *
   * E.g., `helpers/math.py` becomes `helpers.math`; `__init__.py` becomes the
   * package name itself.
   */
  moduleNames(): string[] {
    if (this.getModules !== undefined) {
      return this.getModules();
    }
    const modules = this.files().flatMap((path) => {
      const match = path.match(/^(.*?)(?:\/__init__)?\.pyi?$/);
      if (match === null) {
        return [];
      }
      const moduleName = match[1].replaceAll('/', '.');
      return moduleName.length > 0 ? [moduleName] : [];
    });
    return Array.from(new Set(modules));
  }

  /**
   * Adapts the document `name` to the document-level interface used by
   * CodeEditor. Returns the same object for the same name.
   */
  editorContext(name: string): EditorContext {
    let context = this.editorContexts.get(name);
    if (context === undefined) {
      context = this.createEditorContext(name);
      this.editorContexts.set(name, context);
    }
    return context;
  }

  private createEditorContext(name: string): EditorContext {
    return {
      initialSource: () => '', // empty by default
      currentSource: () => this.text(name) ?? '',
      attachModel: (model) =>
        this.attachModel(model, { file: name, previousLines: 0 }),
      detachModel: (model) => this.detachModel(model),
      updateSource: (source) => this.setFileContent(name, source),
      isApplyingExternalUpdate: () => this.applyingExternal,
      applyModelText: (model, text) => this.setModelText(model, text),
      diagnostics: (liveAnalysis) =>
        toCustomDiagnostics(this.diagnosticsForFile(name), liveAnalysis),
      hoveredPythonName: (model, position) =>
        this.hoveredPythonName(model, position),
      subscribeToAnalysis: (listener) => this.subscribe(listener),
      runtimeFileName: name,
    };
  }

  /* ---------------------------------------------------------
     Monaco providers
  */

  documentRangeSemanticTokens(
    model: editor.ITextModel,
    range: Range,
  ): languages.SemanticTokens | null {
    const document = this.documentForModel(model);
    if (document === undefined) {
      return null;
    }

    const tyRange = this.monacoRangeToTyRange(range, document.previousLines);
    const tokens = this.workspace.semanticTokensInRange(document.name, tyRange);
    if (tokens === undefined) {
      return null;
    }
    return this.generateMonacoTokens(tokens, model, document.previousLines);
  }

  hoveredPythonName(
    model: editor.ITextModel,
    position: Position,
  ): PythonName | null {
    const name = model.getWordAtPosition(position)?.word;
    if (name === undefined) {
      return null;
    }
    const document = this.documentForModel(model);
    if (document === undefined || !isPythonFileName(document.name)) {
      return null;
    }

    const tyPosition = new TyPosition(
      position.lineNumber + document.previousLines,
      position.column,
    );
    const locations = this.workspace.gotoDeclaration(document.name, tyPosition);
    if (locations === undefined) {
      return null;
    }
    const nonEmptyLocations = locations
      // Filter out empty ranges (this can happen when finding the declaration of a module name, e.g., `from <CURSOR>random import random`).
      .filter((loc) => !this.emptyRange(loc.full_range));

    if (nonEmptyLocations.length === 0) {
      return null;
    }

    // In case of multiple declarations, pick the first one (they are listed from the innermost scope to the outermost).
    const path = nonEmptyLocations[0].path;
    const mod = path === document.name ? '.' : moduleFromPath(path);
    return new PythonName(mod, name);
  }

  private registerDocument(
    model: editor.ITextModel,
    mapping: ModelMapping,
    onEdit?: (text: string) => void,
  ) {
    const name = mapping.file;
    const existing = this.documents.get(mapping.file);
    if (existing !== undefined && existing.model !== model) {
      this.detachDocument(name);
    }

    const contentListener = model.onDidChangeContent(() => {
      if (this.applyingExternal) {
        return;
      }
      const text = model.getValue();
      if (onEdit !== undefined) {
        onEdit(text);
      } else {
        this.setFileContent(name, text);
      }
    });
    const disposeListener = model.onWillDispose(() => {
      this.detachDocument(name);
    });

    this.documents.set(name, {
      model,
      previousLines: mapping.previousLines,
      partial: mapping.partial ?? false,
      contentListener,
      disposeListener,
    });
    this.documentNames.set(model, name);
    editorSessionsByModel.set(model, this);
    // Providers may have asked for this model's tokens before it was attached.
    fireSemanticTokensChange();
  }

  private detachDocument(name: string) {
    const entry = this.documents.get(name);
    if (entry === undefined) {
      return;
    }

    this.documents.delete(name);
    this.documentNames.delete(entry.model);
    if (editorSessionsByModel.get(entry.model) === this) {
      editorSessionsByModel.delete(entry.model);
    }
    entry.contentListener.dispose();
    entry.disposeListener.dispose();
  }

  private documentForModel(
    model: editor.ITextModel,
  ): { name: string; previousLines: number } | undefined {
    const name = this.documentNames.get(model);
    if (name === undefined) {
      return undefined;
    }
    const entry = this.documents.get(name);
    return entry === undefined
      ? undefined
      : { name, previousLines: entry.previousLines };
  }

  private syncDocumentText(path: string, content: string) {
    const entry = this.documents.get(path);
    if (entry !== undefined && !entry.partial) {
      this.setModelText(entry.model, content);
    }
  }

  private monacoRangeToTyRange(range: IRange, previousLines: number): TyRange {
    const actualStartLineNumber = range.startLineNumber + previousLines;
    const actualEndLineNumber = range.endLineNumber + previousLines;
    return new TyRange(
      new TyPosition(actualStartLineNumber, range.startColumn),
      new TyPosition(actualEndLineNumber, range.endColumn),
    );
  }

  private generateMonacoTokens(
    semantic: SemanticToken[],
    model: editor.ITextModel,
    previousLines: number,
  ): languages.SemanticTokens {
    const result = [];

    let prevLine = 0;
    let prevChar = 0;

    for (const token of semantic) {
      // Convert from 1-based to 0-based indexing for Monaco
      const line = token.range.start.line - 1;
      const char = token.range.start.column - 1;

      const length = model.getValueLengthInRange(
        toMonacoRange(token.range, previousLines),
      );

      result.push(
        line - prevLine,
        prevLine === line ? char - prevChar : char,
        length,
        token.kind,
        token.modifiers,
      );

      prevLine = line;
      prevChar = char;
    }

    if (result.length > 0) {
      // Adjust the line number to account for previous lines.
      // Note that result[5*ith_token] is the line *difference* for the ith token,
      // so we must adjust only the first token (the only "absolute" one)
      // to correctly position all the tokens.
      result[0] -= previousLines;
    }

    return { data: Uint32Array.from(result) };
  }

  private emptyRange(range: TyRange): boolean {
    return (
      range.start.line === range.end.line &&
      range.start.column === range.end.column
    );
  }

  private notify() {
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}

function moduleFromPath(path: string): string {
  // Standard library 'vendored://stdlib/math.pyi' --> 'math'
  // (but ignores __init__, so that 'vendored://stdlib/string/__init__.pyi' --> 'string')
  const vendoredLibRegex = /^vendored:\/\/stdlib\/(.+?)(?:\/__init__)?\.pyi$/;
  const match = path.match(vendoredLibRegex);
  if (match) {
    return match[1];
  }
  // PyTamaro '/pytamaro/any/some_module.py' --> 'pytamaro', but '/pytamaro/it/some_module.py' --> 'pytamaro.it'
  const matchPyTamaro = path.match(/^\/pytamaro\//);
  if (matchPyTamaro) {
    // but preserve pytamaro.it, pytamaro.de, pytamaro.fr
    const localizedPyTamaro = path.match(/^\/pytamaro\/(it|de|fr)\//);
    if (localizedPyTamaro) {
      return `pytamaro.${localizedPyTamaro[1]}`;
    }
    return 'pytamaro';
  }
  return path.slice(1).replace('.py', '');
}

export function semanticTokensLegend(): languages.SemanticTokensLegend {
  return {
    tokenTypes: SemanticToken.kinds(),
    tokenModifiers: SemanticToken.modifiers(),
  };
}

const semanticTokensListeners = new Set<() => void>();

/**
 * Subscribes to "some file changed, so the semantic tokens of any open
 * document may have changed". Shaped like Monaco's `IEvent<void>`, so it can
 * be passed as the provider's `onDidChange`. Global, like the provider.
 */
export function onSemanticTokensChange(listener: () => void): IDisposable {
  semanticTokensListeners.add(listener);
  return {
    dispose: () => {
      semanticTokensListeners.delete(listener);
    },
  };
}

const fireSemanticTokensChange = debounce(() => {
  Array.from(semanticTokensListeners).forEach((listener) => listener());
}, 150);
