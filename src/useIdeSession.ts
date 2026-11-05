import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorSession } from './editorSession';
import { toolboxFiles as generateToolboxFiles } from './execution/codeExecution';
import type { WorkspaceChanges } from './execution/messageTypes';
import {
  decodeUtf8,
  IdeFile,
  normalizeWorkspacePath,
  pathConflicts,
  sameContent,
} from './ideFiles';
import { IdeFilesPersistence, StoredWorkspace } from './ideFilesPersistence';
import { IdeWorkspace } from './ideWorkspace';
import { ToolboxFunction } from './localStorage/schema';
import useLocalProfile from './localStorage/useLocalProfile';
import { PythonWorkspace } from './pythonWorkspace';

const INITIAL_FILE_NAME = 'main.py';

/** The files of a workspace that has never been used. */
function initialFiles(): IdeFile[] {
  return [{ path: INITIAL_FILE_NAME, content: '' }];
}

/** Whether two file lists contain the same files with the same contents. */
function sameFiles(a: readonly IdeFile[], b: readonly IdeFile[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const contentsByName = new Map(b.map((file) => [file.path, file.content]));
  return a.every((file) => {
    const content = contentsByName.get(file.path);
    return content !== undefined && sameContent(content, file.content);
  });
}

/**
 * The tab to select after `closed` goes away: the previous one, or the next
 * one if it was the first. Empty if no other valid tab remains.
 */
function neighborTab(
  tabs: readonly string[],
  closed: string,
  existing: readonly string[],
): string {
  const idx = tabs.indexOf(closed);
  const others = tabs.filter((tab) => tab !== closed && existing.includes(tab));
  const before = tabs
    .slice(0, Math.max(idx, 0))
    .filter((tab) => others.includes(tab));
  return before.length > 0 ? before[before.length - 1] : (others[0] ?? '');
}

/** The file names in the order in which they are presented, alphabetically. */
function sortedFileNames(workspace: IdeWorkspace): string[] {
  return [...workspace.files()].sort((a, b) => a.localeCompare(b));
}

/**
 * Makes `workspace` contain exactly `files` and `folders`, removing the files
 * that are no longer there.
 */
function replaceWorkspace(
  workspace: IdeWorkspace,
  files: readonly IdeFile[],
  folders: readonly string[],
): void {
  const next = new Set(files.map((file) => file.path));
  workspace
    .files()
    .filter((name) => !next.has(name))
    .forEach((name) => workspace.removeFile(name));
  workspace.addFiles(files);
  workspace.setFolders(folders);
}

/**
 * Owns the files of the IDE.
 *
 * The `IdeWorkspace` is the only owner of file contents; IndexedDB just mirrors
 * it. Unlike an activity, the IDE has no cells: every file is an independent
 * document, and files may be text or binary.
 */
export default function useIdeSession() {
  const { metadata, selectedIdeLibrariesIds: knownLibraries } =
    useLocalProfile();
  // Read through a ref, so that the session (created once) always sees the
  // current toolbox functions, e.g. for `from toolbox import ...` completions.
  const toolboxFunctionsRef = useRef<ToolboxFunction[]>(metadata.toolbox);
  toolboxFunctionsRef.current = metadata.toolbox;

  const [workspace] = useState(() => {
    const editorSession = new EditorSession(
      new PythonWorkspace(knownLibraries),
      undefined,
      () => toolboxFunctionsRef.current,
      undefined,
    );
    const ideWorkspace = new IdeWorkspace(editorSession);
    ideWorkspace.addFiles(initialFiles());
    return ideWorkspace;
  });
  const [persistence] = useState(() => new IdeFilesPersistence());

  useEffect(() => {
    workspace.editorSession.setKnownLibraries(knownLibraries);
  }, [knownLibraries, workspace]);

  // Toolbox functions are exposed to the analyzer as modules, so that imports
  // resolve, but they are not files of the IDE workspace.
  const toolboxFiles = useMemo(
    () => generateToolboxFiles(metadata.toolbox, true),
    [metadata.toolbox],
  );
  const appliedToolboxFileNamesRef = useRef<Set<string>>(new Set());
  const [fileNames, setFileNames] = useState<string[]>(() =>
    sortedFileNames(workspace),
  );
  // Folders created explicitly, so possibly empty.
  const [folderNames, setFolderNames] = useState<string[]>([]);
  // False until the stored files have been loaded into the workspace: the
  // editor must not create its model before that, since workspace writes
  // don't reach an already open model.
  const [loaded, setLoaded] = useState(false);
  const [openTabs, setOpenTabs] = useState<string[]>([INITIAL_FILE_NAME]);
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILE_NAME);
  // Whether the workspace differs from its initial state, so that the reset
  // button is enabled only when it would change something.
  const [modified, setModified] = useState(false);

  useEffect(() => {
    const refreshNames = () => {
      const next = sortedFileNames(workspace);
      setFileNames((prev) => (isEqual(prev, next) ? prev : next));
      const nextFolders = [...workspace.folders()].sort((a, b) =>
        a.localeCompare(b),
      );
      setFolderNames((prev) =>
        isEqual(prev, nextFolders) ? prev : nextFolders,
      );
    };

    const persist = () =>
      persistence.save(workspace.snapshot(), workspace.folders());

    const refreshModified = () => {
      setModified(
        workspace.folders().length > 0 ||
          !sameFiles(workspace.snapshot(), initialFiles()),
      );
    };

    // Applies stored files (first load, or a change made in another tab).
    // Open editors follow, because the workspace updates their models.
    const apply = (saved: StoredWorkspace | null) => {
      replaceWorkspace(
        workspace,
        saved?.files ?? initialFiles(),
        saved?.folders ?? [],
      );
      refreshNames();
      refreshModified();
    };

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    persistence.load().then((saved) => {
      if (cancelled) {
        return;
      }
      apply(saved);
      setLoaded(true);
      // Subscribed only after the first load, so defaults never overwrite
      // storage.
      unsubscribe = workspace.subscribe(() => {
        refreshNames();
        refreshModified();
        persist();
      });
    });

    const stopWatching = persistence.watch(() => {
      void persistence.load().then((saved) => {
        if (!cancelled) {
          apply(saved);
        }
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
      stopWatching();
      void persistence.flush();
    };
  }, [workspace, persistence]);

  // Keep the generated toolbox modules available to the analyzer, and drop
  // modules whose toolbox function no longer exists.
  useEffect(() => {
    const nextNames = new Set(toolboxFiles.map((file) => file.name));
    workspace.editorSession.addToolboxFiles(toolboxFiles);
    appliedToolboxFileNamesRef.current.forEach((name) => {
      if (!nextNames.has(name)) {
        workspace.editorSession.closeDocument(name);
      }
    });
    appliedToolboxFileNamesRef.current = nextNames;
  }, [workspace, toolboxFiles]);

  // Tabs and selection can refer to files that another tab has deleted:
  // derive the valid ones instead of syncing them with an effect. Closing
  // every tab is allowed, so an empty list is a valid state.
  const openFiles = useMemo(
    () => openTabs.filter((name) => fileNames.includes(name)),
    [openTabs, fileNames],
  );
  const activeFile = openFiles.includes(selectedFile)
    ? selectedFile
    : (openFiles[0] ?? '');

  const openFile = useCallback(
    (name: string) => {
      if (!workspace.hasFile(name)) {
        return;
      }
      setOpenTabs((current) =>
        current.includes(name) ? current : [...current, name],
      );
      setSelectedFile(name);
    },
    [workspace],
  );

  const closeFile = useCallback(
    (name: string) => {
      setOpenTabs(openTabs.filter((file) => file !== name));
      setSelectedFile((current) =>
        current === name ? neighborTab(openTabs, name, fileNames) : current,
      );
    },
    [fileNames, openTabs],
  );

  /**
   * Deletes a file and closes its tab. Returns false for files that do not
   * exist.
   */
  const deleteFile = useCallback(
    (name: string) => {
      if (!workspace.hasFile(name)) {
        return false;
      }
      workspace.removeFile(name);
      closeFile(name);
      return true;
    },
    [closeFile, workspace],
  );

  /**
   * Renames (or moves) a file and updates its tab. Returns false for missing
   * files and unavailable names.
   */
  const renameFile = useCallback(
    (oldName: string, newName: string) => {
      const target = normalizeWorkspacePath(newName);
      if (
        target === undefined ||
        target === oldName ||
        !workspace.hasFile(oldName)
      ) {
        return false;
      }
      const otherNames = workspace.files().filter((name) => name !== oldName);
      if (pathConflicts(target, otherNames)) {
        return false;
      }
      if (!workspace.renameFile(oldName, target)) {
        return false;
      }
      setOpenTabs((current) =>
        current.map((file) => (file === oldName ? target : file)),
      );
      setSelectedFile((current) => (current === oldName ? target : current));
      return true;
    },
    [workspace],
  );

  /**
   * Creates a file, and opens it in a tab unless `open` is false. Returns false
   * if the name is empty or taken (unless `overwrite` is set).
   */
  const addFile = useCallback(
    (
      name: string,
      content: string | Uint8Array = '',
      {
        overwrite = false,
        open = true,
      }: { overwrite?: boolean; open?: boolean } = {},
    ) => {
      const path = normalizeWorkspacePath(name);
      if (path === undefined) {
        return false;
      }
      const exists = workspace.hasFile(path);
      if (exists && !overwrite) {
        return false;
      }
      if (workspace.folders().includes(path) === true) {
        return false;
      }
      if (!exists && pathConflicts(path, workspace.files())) {
        return false;
      }
      workspace.setFile({ path, content });
      if (open) {
        openFile(path);
      }
      return true;
    },
    [openFile, workspace],
  );

  /**
   * Creates a (possibly empty) folder. Returns false if the path is invalid or
   * conflicts with an existing file.
   */
  const addFolder = useCallback(
    (name: string) => {
      const path = normalizeWorkspacePath(name);
      if (
        path === undefined ||
        workspace
          .files()
          .some((file) => file === path || path.startsWith(`${file}/`))
      ) {
        return false;
      }
      workspace.addFolder(path);
      return true;
    },
    [workspace],
  );

  /**
   * Renames (or moves) a folder together with everything inside it. Returns
   * false if the target is invalid or unavailable.
   */
  const renameFolder = useCallback(
    (oldPath: string, newName: string) => {
      const target = normalizeWorkspacePath(newName);
      const prefix = `${oldPath}/`;
      if (
        target === undefined ||
        target === oldPath ||
        target.startsWith(prefix)
      ) {
        return false;
      }
      const inside = (name: string) => name.startsWith(prefix);
      const moved = workspace.files().filter(inside);
      const others = [
        ...workspace.files().filter((name) => !inside(name)),
        ...workspace.folders(),
      ];
      if (pathConflicts(target, others)) {
        return false;
      }
      const rebase = (name: string) => `${target}/${name.slice(prefix.length)}`;
      const movedFolders = workspace
        .folders()
        .filter((name) => name === oldPath || inside(name));
      moved.forEach((name) => workspace.renameFile(name, rebase(name)));
      movedFolders.forEach((name) => {
        workspace.removeFolder(name);
        workspace.addFolder(name === oldPath ? target : rebase(name));
      });
      const rename = (name: string) => (inside(name) ? rebase(name) : name);
      setOpenTabs((current) => current.map(rename));
      setSelectedFile(rename);
      return true;
    },
    [workspace],
  );

  /** Deletes a folder together with everything inside it. */
  const deleteFolder = useCallback(
    (path: string) => {
      const prefix = `${path}/`;
      workspace
        .files()
        .filter((name) => name.startsWith(prefix))
        .forEach((name) => workspace.removeFile(name));
      workspace
        .folders()
        .filter((name) => name === path || name.startsWith(prefix))
        .forEach((name) => workspace.removeFolder(name));
    },
    [workspace],
  );

  /**
   * Restores the workspace to its initial files, discarding every file and
   * edit made by the user.
   */
  const resetWorkspace = useCallback(() => {
    const initial = initialFiles();
    replaceWorkspace(workspace, initial, []);
    setOpenTabs(initial.map((file) => file.path));
    setSelectedFile(initial[0]?.path ?? '');
    persistence.save(workspace.snapshot(), []);
  }, [persistence, workspace]);

  /** Applies the files that a Python run created, modified, or deleted. */
  const syncWorkspaceChanges = useCallback(
    (changes: WorkspaceChanges) => {
      changes.changed.forEach(({ name, content }) => {
        const otherNames = workspace.files().filter((path) => path !== name);
        if (pathConflicts(name, otherNames)) {
          return;
        }
        const text = decodeUtf8(content);
        workspace.setFile({ path: name, content: text ?? content });
      });
      changes.deleted.forEach((name) => {
        workspace.removeFile(name);
      });
    },
    [workspace],
  );

  return {
    workspace,
    loaded,
    fileNames,
    openFiles,
    activeFile,
    modified,
    addFile,
    addFolder,
    renameFolder,
    deleteFolder,
    folderNames,
    openFile,
    closeFile,
    deleteFile,
    renameFile,
    resetWorkspace,
    syncWorkspaceChanges,
  };
}
