import type { Monaco } from '@monaco-editor/react';
import { debounce, uniqBy } from 'lodash';
import type { editor, Position } from 'monaco-editor';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { LocalStorageCodeCells } from './codeCellsPersistence';
import {
  type CustomDiagnostic,
  toCustomDiagnostics,
} from './editor/diagnostics';
import type { EditorContext } from './editor/editorContext';
import { EditorSession } from './editorSession';
import { cellFileName, toolboxFiles } from './execution/codeExecution';
import type { CodeCellState, ToolboxFunction } from './localStorage/schema';
import { LiveAnalysisStatus } from './localStorage/schema';
import useLocalProfile from './localStorage/useLocalProfile';
import { listToolboxFunctions } from './localStorage/useLocalToolbox';
import type {
  PythonFunction,
  PythonName,
} from './python-analyzer/python_analyzer';
import type { AnalysisResult, FilesAnalysisResult } from './pythonWorkspace';
import type { PythonFile } from './schemas/activitySchema';
import { countLines, joinLines } from './sourceUtils';

const NOTIFY_DEBOUNCE_MS = 50;

function codeCellsEqual(a: CodeCellState[], b: CodeCellState[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (cell, idx) =>
        cell.source === b[idx].source &&
        cell.originalIndex === b[idx].originalIndex,
    )
  );
}

/**
 * Restricts the analysis of a prefix file (cells `0..i` joined) to cell `i`.
 *
 * Offsets in `fileAnalysis` are relative to the whole prefix file, and
 * `previousCellsLength` is the length of the joined cells before cell `i`.
 * Only the ellipsis and called names located in the cell are kept, and the
 * import ranges are made relative to the cell.
 *
 * Pure: it returns a new object, because `fileAnalysis` is cached and shared
 * by the workspace and must never be mutated. Slicing is a cell-only concern;
 * consumers that work on whole files should use the workspace results as is.
 */
function sliceAnalysisFrom(
  fileAnalysis: AnalysisResult,
  previousCellsLength: number,
): AnalysisResult {
  // The wasm result exposes its fields as prototype accessors, so they must be
  // copied explicitly: spreading the object would drop them.
  return {
    called_names: fileAnalysis.called_names.filter(
      (calledName) => calledName.start >= previousCellsLength,
    ),
    defined_constants: fileAnalysis.defined_constants,
    defined_functions: fileAnalysis.defined_functions,
    ellipsis: fileAnalysis.ellipsis.filter(
      (start) => start >= previousCellsLength,
    ),
    import_ranges: fileAnalysis.import_ranges.map((range) => ({
      start: range.start - previousCellsLength,
      end: range.end - previousCellsLength,
    })),
    imported_names: fileAnalysis.imported_names,
    last_expr_range: fileAnalysis.last_expr_range,
    parse_errors: fileAnalysis.parse_errors,
  };
}

/**
 * Owns the cells of an activity on top of an `EditorSession`.
 *
 * A cell `i` is represented by the cumulative prefix `cells[0..i]`, because
 * executing cell `i` executes all the cells before it. The editor session never
 * sees cells: this class composes the prefix files, maps Monaco models onto
 * them, and slices the file analysis per cell. Saving cells between visits is
 * delegated to an optional `CodeCellsPersistence`.
 */
export class ActivitySession {
  private editorSession: EditorSession;
  private sources: string[];
  private initialCells: CodeCellState[];
  private originalIndices: number[];
  private toolboxFunctions: ToolboxFunction[] = [];
  private analysisResults: (AnalysisResult | undefined)[];
  private newAnalysisResultsListeners = new Map<number, Set<() => void>>();
  private listeners = new Set<() => void>();
  private models = new Map<number, editor.ITextModel>();
  private modelCells = new WeakMap<editor.ITextModel, number>(); // reverse lookup
  private currentSnapshot: CodeCellState[] | null = null;
  private initialSnapshot: CodeCellState[] | null = null;
  private editorContexts = new Map<number, EditorContext>();

  private scheduleNotify = debounce(() => this.notify(), NOTIFY_DEBOUNCE_MS);
  private scheduleReanalysis = debounce(
    () => this.recomposeAndAnalyzeAll(),
    NOTIFY_DEBOUNCE_MS,
  );
  private stopWatching: (() => void) | undefined;
  private readonly localStorageCodeCells: LocalStorageCodeCells | undefined;

  constructor(
    initialCodeCells: CodeCellState[] = [],
    extraPythonFiles: PythonFile[] = [],
    localStorageCodeCells?: LocalStorageCodeCells,
  ) {
    this.editorSession = new EditorSession(
      undefined,
      (model) => this.getAnalysisResultForModel(model),
      () => this.toolboxFunctions,
      // The workspace holds internal files (cell prefixes, toolbox modules),
      // which must not be suggested as modules.
      () => [],
    );
    this.initialCells = initialCodeCells;
    this.sources = initialCodeCells.map((cell) => cell.source);
    this.originalIndices = initialCodeCells.map((cell) => cell.originalIndex);
    this.analysisResults = [];
    this.localStorageCodeCells = localStorageCodeCells;
    this.editorSession.addFiles(extraPythonFiles);
    this.recomposeAndAnalyzeAll();
  }

  /**
   * Loads saved cells and starts watching for external changes.
   * Kept out of the constructor so that creating a session during render has
   * no side effects. Idempotent.
   */
  connect() {
    if (
      this.localStorageCodeCells === undefined ||
      this.stopWatching !== undefined
    ) {
      return;
    }
    const saved = this.localStorageCodeCells.load();
    if (saved !== null) {
      this.applyExternalCodeCells(saved);
    }
    this.stopWatching = this.localStorageCodeCells.watch((cells) => {
      this.applyExternalCodeCells(cells ?? this.getInitialCodeCells());
    });
  }

  /** Undoes `connect` (flushing pending writes). `connect` can be called again. */
  disconnect() {
    this.stopWatching?.();
    this.stopWatching = undefined;
  }

  /* ---------------------------------------------------------
     Files
  */

  setToolboxFunctions(functions: ToolboxFunction[]) {
    this.toolboxFunctions = functions;
    if (this.editorSession.addFiles(toolboxFiles(functions))) {
      this.scheduleReanalysis();
    }
  }

  getToolboxFunctions(): ToolboxFunction[] {
    return this.toolboxFunctions;
  }

  analyzeExtraPythonFiles(files: PythonFile[]): FilesAnalysisResult {
    return files.flatMap((file) => {
      const analysisResult = this.editorSession.analyzeFile(file.name);
      return analysisResult === undefined
        ? []
        : [{ name: file.name, analysisResult }];
    });
  }

  /* ---------------------------------------------------------
     Cell state
  */

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getCodeCells = (): CodeCellState[] => {
    if (this.currentSnapshot === null) {
      this.currentSnapshot = this.sources.map((source, idx) => ({
        source,
        originalIndex: this.originalIndices[idx] ?? idx,
      }));
    }
    return this.currentSnapshot;
  };

  getInitialCodeCells = (): CodeCellState[] => {
    if (this.initialSnapshot === null) {
      this.initialSnapshot = this.initialCells.map((cell, idx) => ({
        source: cell.source,
        originalIndex: cell.originalIndex ?? idx,
      }));
    }
    return this.initialSnapshot;
  };

  getSource(cellIdx: number): string {
    return this.sources[cellIdx] ?? '';
  }

  getInitialSource(cellIdx: number): string {
    return this.initialCells[cellIdx]?.source ?? '';
  }

  getSourcesUpTo(cellIdx: number): string[] {
    return this.sources.slice(0, cellIdx + 1);
  }

  codeCellsWrongLength(): boolean {
    return this.getCodeCells().length !== this.getInitialCodeCells().length;
  }

  updateSource(cellIdx: number, newSource: string) {
    const changed = this.sources[cellIdx] !== newSource;
    if (!changed && this.analysisResults[cellIdx] !== undefined) {
      return;
    }

    this.sources[cellIdx] = newSource;
    // Invalidate the snapshot immediately, even though subscribers are
    // notified with a small debounce: persistence must always see the latest
    // source (e.g., when flushing on pagehide).
    this.currentSnapshot = null;

    // The line offset of this cell and of all the following ones may change.
    this.updateModelMappingsFrom(cellIdx);

    // Prefix files from this cell onward include the new source.
    this.rewriteCellsFrom(cellIdx);

    if (changed) {
      this.scheduleNotify();
      this.persist();
    }
  }

  setCodeCells(cells: CodeCellState[], forceNotify = false) {
    if (!forceNotify && codeCellsEqual(this.getCodeCells(), cells)) {
      return;
    }
    this.replaceCodeCells(cells);
    this.notify();
    this.persist();
  }

  replaceInitialCodeCells(cells: CodeCellState[]) {
    this.initialCells = cells;
    this.initialSnapshot = null;
    this.setCodeCells(cells, true);
  }

  /* ---------------------------------------------------------
     Monaco model ownership
  */

  attachModel(cellIdx: number, model: editor.ITextModel) {
    if (this.models.get(cellIdx) !== model) {
      this.detachModel(cellIdx);
      this.models.set(cellIdx, model);
    }
    this.modelCells.set(model, cellIdx);
    this.editorSession.attachModel(
      model,
      this.modelMapping(cellIdx),
      (source) => this.updateSource(cellIdx, source),
    );
    this.updateSource(cellIdx, model.getValue());
  }

  detachModel(cellIdx: number, model?: editor.ITextModel) {
    const current = this.models.get(cellIdx);
    if (current === undefined || (model !== undefined && current !== model)) {
      return;
    }
    this.editorSession.detachModel(current);
    this.modelCells.delete(current);
    this.models.delete(cellIdx);
  }

  /* ---------------------------------------------------------
     Monaco providers
  */

  hoveredPythonName(
    model: editor.ITextModel,
    position: Position,
  ): PythonName | null {
    return this.editorSession.hoveredPythonName(model, position);
  }

  /**
   * Adapts cell `cellIdx` to the document-level interface used by CodeEditor.
   * Always returns the same object for the same cell, so it can be used as a
   * dependency without memoizing at the call site.
   */
  editorContext(cellIdx: number): EditorContext {
    let context = this.editorContexts.get(cellIdx);
    if (context === undefined) {
      context = this.createEditorContext(cellIdx);
      this.editorContexts.set(cellIdx, context);
    }
    return context;
  }

  private createEditorContext(cellIdx: number): EditorContext {
    return {
      initialSource: () => this.getInitialSource(cellIdx),
      currentSource: () => this.getSource(cellIdx),
      attachModel: (model) => this.attachModel(cellIdx, model),
      detachModel: (model) => this.detachModel(cellIdx, model),
      updateSource: (source) => this.updateSource(cellIdx, source),
      diagnostics: (liveAnalysis) =>
        this.diagnosticsForCell(cellIdx, liveAnalysis),
      hoveredPythonName: (model, position) =>
        this.hoveredPythonName(model, position),
      subscribeToAnalysis: (listener) => {
        this.addNewAnalysisResultListener(cellIdx, listener);
        return () => {
          this.removeNewAnalysisResultListener(cellIdx, listener);
        };
      },
      evalExprDiagnostic: (monacoInstance, editorInstance) =>
        this.evalExprDiagnostics(monacoInstance, editorInstance, cellIdx),
    };
  }

  getAnalysisResultForModel(
    model: editor.ITextModel,
  ): AnalysisResult | undefined {
    const cellIdx = this.modelCells.get(model);
    return cellIdx === undefined ? undefined : this.analysisResults[cellIdx];
  }

  /* ---------------------------------------------------------
     Analysis
  */

  getAnalysisResult(cellIdx: number): AnalysisResult | undefined {
    return this.analysisResults[cellIdx];
  }

  addNewAnalysisResultListener(cellIdx: number, handler: () => void) {
    const listeners = this.newAnalysisResultsListeners.get(cellIdx);
    if (listeners === undefined) {
      this.newAnalysisResultsListeners.set(cellIdx, new Set([handler]));
    } else {
      listeners.add(handler);
    }
  }

  removeNewAnalysisResultListener(cellIdx: number, handler: () => void) {
    this.newAnalysisResultsListeners.get(cellIdx)?.delete(handler);
  }

  functionsDefinedInCell(cellIdx: number): PythonFunction[] {
    const analysisResult = this.getAnalysisResult(cellIdx);
    if (!analysisResult) {
      return [];
    }
    const previousCellsLength = this.computePreviousCellsLength(cellIdx);
    return analysisResult.defined_functions.filter(
      (fn) => fn.start >= previousCellsLength,
    );
  }

  diagnosticCounts(
    cellIdx: number,
    liveAnalysis: LiveAnalysisStatus,
  ): { upToCell: number; beforeCell: number } {
    let upToCell = 0;
    let beforeCell = 0;
    let previousLines = 0;
    for (let idx = 0; idx <= cellIdx && idx < this.sources.length; idx += 1) {
      if (idx < cellIdx) {
        beforeCell = upToCell;
      }
      upToCell += this.diagnosticsAt(idx, liveAnalysis, previousLines).length;
      previousLines += countLines(this.sources[idx] ?? '');
    }
    return { upToCell, beforeCell };
  }

  evalExprDiagnostics(
    monacoInstance: Monaco,
    editorInstance: editor.IStandaloneCodeEditor,
    cellIdx: number,
  ): editor.IModelDeltaDecoration | null {
    const analysisResult = this.getAnalysisResult(cellIdx);
    const model = editorInstance.getModel();
    if (!model || analysisResult?.last_expr_range === undefined) {
      return null;
    }
    const { start, end } = analysisResult.last_expr_range;
    const previousLines = this.precedingLines(cellIdx);
    return {
      range: new monacoInstance.Range(
        start.line - previousLines,
        start.column,
        end.line - previousLines,
        end.column,
      ),
      options: {
        className: 'eval-result-code-decoration',
        isWholeLine: false,
      },
    };
  }

  private diagnosticsForCell(
    cellIdx: number,
    liveAnalysis: LiveAnalysisStatus,
  ): CustomDiagnostic[] {
    return this.diagnosticsAt(
      cellIdx,
      liveAnalysis,
      this.precedingLines(cellIdx),
    );
  }

  private diagnosticsAt(
    cellIdx: number,
    liveAnalysis: LiveAnalysisStatus,
    previousLines: number,
  ): CustomDiagnostic[] {
    return toCustomDiagnostics(
      this.editorSession.diagnosticsForFile(cellFileName(cellIdx)),
      liveAnalysis,
      previousLines,
    );
  }

  private recomposeAndAnalyzeAll() {
    this.analysisResults = [];
    this.rewriteCellsFrom(0);
    this.updateModelMappingsFrom(0);
  }

  /**
   * Rewrites the prefix files of cells `from..end` in one batch (a single
   * cache invalidation), then analyzes them. Later cells are refreshed
   * eagerly so that their analysis never lags behind an upstream edit.
   */
  private rewriteCellsFrom(from: number) {
    this.editorSession.addFiles(
      this.sources.slice(from).map((_, offset) => ({
        name: cellFileName(from + offset),
        content: joinLines(this.sources.slice(0, from + offset + 1)),
      })),
    );
    for (let idx = from; idx < this.sources.length; idx += 1) {
      this.analyzeCell(idx);
    }
  }

  private analyzeCell(cellIdx: number) {
    const fileAnalysis = this.editorSession.analyzeFile(cellFileName(cellIdx));
    if (fileAnalysis === undefined) {
      this.analysisResults[cellIdx] = undefined;
    } else {
      this.analysisResults[cellIdx] = sliceAnalysisFrom(
        fileAnalysis,
        this.computePreviousCellsLength(cellIdx),
      );
    }
    this.notifyNewAnalysisResults(cellIdx);
  }

  private notifyNewAnalysisResults(cellIdx: number) {
    this.newAnalysisResultsListeners.get(cellIdx)?.forEach((callback) => {
      callback();
    });
  }

  private computePreviousCellsLength(cellIdx: number): number {
    return joinLines(this.sources.slice(0, cellIdx)).length;
  }

  precedingLines(cellIdx: number): number {
    return this.sources
      .slice(0, cellIdx)
      .reduce((total, source) => total + countLines(source), 0);
  }

  private modelMapping(cellIdx: number) {
    return {
      file: cellFileName(cellIdx),
      previousLines: this.precedingLines(cellIdx),
      partial: true,
    };
  }

  private updateModelMappingsFrom(startIdx: number) {
    let previousLines = this.precedingLines(startIdx);
    for (let idx = startIdx; idx < this.sources.length; idx += 1) {
      const model = this.liveModel(idx);
      if (model !== undefined) {
        this.editorSession.attachModel(model, {
          file: cellFileName(idx),
          previousLines: previousLines,
          partial: true,
        });
      }
      previousLines += countLines(this.sources[idx]);
    }
  }

  private syncModels() {
    Array.from(this.models.keys()).forEach((idx) => {
      const model = this.liveModel(idx);
      if (model !== undefined) {
        this.editorSession.setModelText(model, this.sources[idx] ?? '');
      }
    });
  }

  /** The attached model of a cell, forgetting it if it has been disposed. */
  private liveModel(cellIdx: number): editor.ITextModel | undefined {
    const model = this.models.get(cellIdx);
    if (model?.isDisposed() === true) {
      this.models.delete(cellIdx);
      return undefined;
    }
    return model;
  }

  private notify() {
    this.scheduleNotify.cancel();
    this.currentSnapshot = null;
    this.listeners.forEach((listener) => {
      listener();
    });
  }

  /** Applies cells that did not originate from the user (storage, other tabs). */
  private applyExternalCodeCells(cells: CodeCellState[]) {
    if (codeCellsEqual(this.getCodeCells(), cells)) {
      return;
    }
    this.replaceCodeCells(cells);
    this.notify();
  }

  private replaceCodeCells(cells: CodeCellState[]) {
    this.sources = cells.map((cell) => cell.source);
    this.originalIndices = cells.map((cell) => cell.originalIndex);
    this.analysisResults = [];
    this.currentSnapshot = null;

    this.recomposeAndAnalyzeAll();
    this.syncModels();
  }

  /**
   * Saves the cells, but only once connected: before `connect` has loaded what
   * was saved earlier, writing would overwrite it with the initial cells.
   */
  private persist() {
    if (this.stopWatching !== undefined) {
      this.localStorageCodeCells?.save(this.getCodeCells());
    }
  }
}

const NO_EXTRA_TOOLBOX_FUNCTIONS: ToolboxFunction[] = [];

function createActivitySession(
  initialCodeCells: CodeCellState[],
  storageKey: string | undefined,
  extraPythonFiles: PythonFile[],
): ActivitySession {
  return new ActivitySession(
    initialCodeCells,
    extraPythonFiles,
    storageKey === undefined
      ? undefined
      : new LocalStorageCodeCells(storageKey),
  );
}

/**
 * Creates an `ActivitySession` for the lifetime of the calling component,
 * and a new one whenever `storageKey` changes.
 * When a storage key is given, cell changes are persisted to local storage.
 */
export default function useActivitySession(
  initialCodeCells: CodeCellState[] = [],
  storageKey?: string,
  extraPythonFiles: PythonFile[] = [],
  extraToolboxFunctions: ToolboxFunction[] = NO_EXTRA_TOOLBOX_FUNCTIONS,
): ActivitySession {
  const [entry, setEntry] = useState(() => ({
    storageKey,
    session: createActivitySession(
      initialCodeCells,
      storageKey,
      extraPythonFiles,
    ),
  }));
  let activitySession = entry.session;
  if (entry.storageKey !== storageKey) {
    // Different persisted activity: start over (derived-state pattern).
    activitySession = createActivitySession(
      initialCodeCells,
      storageKey,
      extraPythonFiles,
    );
    setEntry({ storageKey, session: activitySession });
  }

  // A layout effect on purpose: every layout effect of a commit runs before
  // any passive effect, so the saved cells are loaded before the effects of
  // child components (e.g., useSharedCodeFromQuery, resetOnMount) read or
  // change the session. With useEffect, children would run first.
  useLayoutEffect(() => {
    activitySession.connect();
    return () => {
      activitySession.disconnect();
    };
  }, [activitySession]);

  // Update the toolbox files in the analyzer whenever the toolbox changes.

  const { metadata } = useLocalProfile();
  const toolboxFunctions = useMemo(
    () =>
      // Extra functions come first, so they shadow a saved function with the
      // same name (like `retrieveToolboxSources` does for execution).
      uniqBy(
        [...extraToolboxFunctions, ...listToolboxFunctions(metadata.toolbox)],
        (fn) => fn.name,
      ),
    [extraToolboxFunctions, metadata.toolbox],
  );

  useEffect(() => {
    activitySession.setToolboxFunctions(toolboxFunctions);
  }, [activitySession, toolboxFunctions]);

  return activitySession;
}
