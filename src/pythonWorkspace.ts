import { isEqual } from 'lodash';
import type { IRange } from 'monaco-editor';
import type {
  FileHandle,
  LocationLink,
  SemanticToken,
  Position as TyPosition,
  Range as TyRange,
  AnalysisResult as WasmAnalysisResult,
  TextRange as WasmTextRange,
} from './python-analyzer/python_analyzer';
import {
  analyzeFile as analyzeFileWithWorkspace,
  initWorkspaceWithLibraries,
  Workspace as TyWorkspace,
} from './python-analyzer/python_analyzer';

export type WorkspaceFile = {
  name: string;
  content: string;
};

export type FileDiagnostic = {
  id: string;
  message: string;
  range: IRange | null;
};

export function toMonacoRange(range: TyRange, previousLines = 0): IRange {
  const { start, end } = range;
  return {
    startLineNumber: start.line - previousLines,
    startColumn: start.column,
    endLineNumber: end.line - previousLines,
    endColumn: end.column,
  };
}

/**
 * The wasm analysis result, minus its memory-management members.
 *
 * Only the container is decoupled from wasm: the field types (e.g.,
 * `PythonFunction`, `PythonName`) are still the wasm-defined ones, on purpose.
 *
 * Dropping `free`, `[Symbol.dispose]` and the internal pointer matters because
 * it makes results plain, immutable-by-convention data: the workspace caches
 * and shares them across consumers, and derived results (e.g., the analysis of
 * a notebook cell, see `sliceAnalysisFrom`) can be built as object literals.
 * Offsets are relative to the analyzed text.
 */
export type AnalysisResult = Pick<
  WasmAnalysisResult,
  | 'called_names'
  | 'defined_constants'
  | 'defined_functions'
  | 'ellipsis'
  | 'imported_names'
  | 'last_expr_range'
  | 'parse_errors'
> & {
  import_ranges: Pick<WasmTextRange, 'start' | 'end'>[];
};

export type FilesAnalysisResult = {
  name: string;
  analysisResult: AnalysisResult;
}[];

type Cached<T> = {
  revision: number;
  value: T;
};

function normalizedLibraries(libraries: readonly string[]): string[] {
  return Array.from(new Set(libraries)).sort();
}

/**
 * Wraps a Python analyzer workspace and tracks the files in it.
 *
 * The analyzer workspace owns the file contents: writes go straight to it and
 * reads (e.g., `sourceText`) come from there. This class only keeps file
 * handles and the analysis caches, so it never duplicates file content.
 *
 * This layer is deliberately independent of Monaco, React, activities and
 * toolboxes: it only maps file paths to contents and analysis results. Callers
 * decide which files to add (source files, extra activity files, generated
 * toolbox modules, ...).
 *
 * Editing a file does not trigger analysis; callers request analysis or
 * diagnostics when they need them. Caches are invalidated through a
 * workspace-wide revision because changing one file can affect the analysis of
 * every file that imports it. Recomputing lazily keeps this correct without
 * needing an import graph yet.
 */
export class PythonWorkspace {
  private tyWorkspace: TyWorkspace;
  private knownLibraries: string[];
  private fileHandles = new Map<string, FileHandle>();
  // Files that belong to the toolbox rather than to the user's workspace.
  // They are analyzable but are not listed as workspace files.
  private toolboxFiles = new Set<string>();
  private analysisResults = new Map<string, Cached<AnalysisResult>>();
  private diagnostics = new Map<string, Cached<FileDiagnostic[]>>();
  private revision = 0;

  constructor(libraries: readonly string[] = []) {
    this.knownLibraries = normalizedLibraries(libraries);
    this.tyWorkspace = initWorkspaceWithLibraries(this.knownLibraries);
  }

  addFiles(files: readonly WorkspaceFile[]): boolean {
    let changed = false;
    files.forEach((file) => {
      if (this.writeFile(file.name, file.content)) {
        changed = true;
      }
    });
    if (changed) {
      this.invalidate();
    }
    return changed;
  }

  /**
   * Adds files that belong to the toolbox.
   *
   * Like {@link addFiles}, but the files are not listed by {@link files}: they
   * are visible to the analyzer only, not to the user's workspace.
   */
  addToolboxFiles(files: readonly WorkspaceFile[]): boolean {
    let changed = false;
    files.forEach((file) => {
      this.toolboxFiles.add(file.name);
      if (this.writeFile(file.name, file.content)) {
        changed = true;
      }
    });
    if (changed) {
      this.invalidate();
    }
    return changed;
  }

  setFileContent(path: string, content: string): boolean {
    const changed = this.writeFile(path, content);
    if (changed) {
      this.invalidate();
    }
    return changed;
  }

  /**
   * Changes the optional libraries whose imports the analyzer accepts.
   *
   * The libraries themselves live in Pyodide's file system, which the analyzer
   * cannot see. Changing this list requires a fresh analyzer workspace;
   * existing files are carried over, and cached analysis is discarded.
   */
  setKnownLibraries(libraries: readonly string[]): boolean {
    const next = normalizedLibraries(libraries);
    if (isEqual(this.knownLibraries, next)) {
      return false;
    }

    const files = Array.from(this.fileHandles, ([path, handle]) => ({
      path,
      content: this.tyWorkspace.sourceText(handle),
    }));
    this.tyWorkspace = initWorkspaceWithLibraries(next);
    this.fileHandles.clear();
    files.forEach(({ path, content }) => {
      this.fileHandles.set(path, this.tyWorkspace.openFile(path, content));
    });
    this.knownLibraries = next;
    this.invalidate();
    return true;
  }

  /** The workspace files, excluding those that belong to the toolbox. */
  files(): readonly string[] {
    return Array.from(this.fileHandles.keys()).filter(
      (path) => !this.toolboxFiles.has(path),
    );
  }

  hasFile(path: string): boolean {
    return this.fileHandles.has(path);
  }

  text(path: string): string | undefined {
    const fileHandle = this.fileHandles.get(path);
    if (fileHandle === undefined) {
      return undefined;
    }
    return this.tyWorkspace.sourceText(fileHandle);
  }

  closeFile(path: string): void {
    const fileHandle = this.fileHandles.get(path);
    if (fileHandle === undefined) {
      return;
    }
    this.tyWorkspace.closeFile(fileHandle);
    this.fileHandles.delete(path);
    this.toolboxFiles.delete(path);
    this.invalidate();
  }

  analyzeFile(path: string): AnalysisResult | undefined {
    const cached = this.analysisResults.get(path);
    if (cached?.revision === this.revision) {
      return cached.value;
    }
    const fileHandle = this.fileHandles.get(path);
    if (fileHandle === undefined) {
      return undefined;
    }
    const result = analyzeFileWithWorkspace(this.tyWorkspace, fileHandle);
    this.analysisResults.set(path, {
      revision: this.revision,
      value: result,
    });
    return result;
  }

  diagnosticsForFile(path: string): FileDiagnostic[] {
    const cached = this.diagnostics.get(path);
    if (cached?.revision === this.revision) {
      return cached.value;
    }
    const fileHandle = this.fileHandles.get(path);
    if (fileHandle === undefined) {
      return [];
    }
    const diagnostics = this.tyWorkspace
      .checkFile(fileHandle)
      .map((diagnostic) => {
        // Convert eagerly: diagnostics are "deferred" and would otherwise be
        // read after the workspace has changed.
        const range = diagnostic.toRange(this.tyWorkspace);
        return {
          id: diagnostic.id(),
          message: diagnostic.message(),
          range: range === undefined ? null : toMonacoRange(range),
        };
      });
    this.diagnostics.set(path, {
      revision: this.revision,
      value: diagnostics,
    });
    return diagnostics;
  }

  semanticTokensInRange(
    path: string,
    range: TyRange,
  ): SemanticToken[] | undefined {
    const fileHandle = this.fileHandles.get(path);
    if (fileHandle === undefined) {
      return undefined;
    }
    return this.tyWorkspace.semanticTokensInRange(fileHandle, range);
  }

  gotoDeclaration(
    path: string,
    position: TyPosition,
  ): LocationLink[] | undefined {
    const fileHandle = this.fileHandles.get(path);
    if (fileHandle === undefined) {
      return undefined;
    }
    return this.tyWorkspace.gotoDeclaration(fileHandle, position);
  }

  private writeFile(path: string, content: string): boolean {
    const handle = this.fileHandles.get(path);
    if (handle !== undefined) {
      if (this.tyWorkspace.sourceText(handle) === content) {
        return false;
      }
      this.tyWorkspace.updateFile(handle, content);
    } else {
      this.fileHandles.set(path, this.tyWorkspace.openFile(path, content));
    }
    return true;
  }

  private invalidate() {
    this.revision += 1;
    this.analysisResults.clear();
    this.diagnostics.clear();
  }
}
