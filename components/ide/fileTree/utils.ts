/**
 * Pure helpers for juggling the flat, slash-separated paths of the IDE
 * workspace: turning them into a folder forest, and back.
 */

import { DragEvent } from 'react';

/**
 * What the inline name input is currently editing, if anything.
 */
export type TreeEdit =
  | { mode: 'create'; kind: 'file' | 'folder'; parent: string }
  | { mode: 'rename'; path: string }
  | null;

export const FOLDER_PREFIX = 'dir:';

export type FileTreeNode =
  | { type: 'file'; name: string; path: string }
  | { type: 'folder'; name: string; path: string; children: FileTreeNode[] };

export type FileNode = Extract<FileTreeNode, { type: 'file' }>;
export type FolderNode = Extract<FileTreeNode, { type: 'folder' }>;

/** Builds a folder tree from the flat, slash-separated paths of the workspace. */
export function buildFileForest(
  paths: readonly string[],
  emptyFolders: readonly string[],
): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const folders = new Map<string, FolderNode>();

  const ensureFolder = (segments: string[]): FileTreeNode[] => {
    let current = root;
    let prefix = '';
    segments.forEach((segment) => {
      prefix = prefix.length === 0 ? segment : `${prefix}/${segment}`;
      let folder = folders.get(prefix);
      if (folder === undefined) {
        folder = { type: 'folder', name: segment, path: prefix, children: [] };
        folders.set(prefix, folder);
        current.push(folder);
      }
      current = folder.children;
    });
    return current;
  };
  emptyFolders.forEach((path) => ensureFolder(path.split('/')));
  paths.forEach((path) => {
    const segments = path.split('/');
    ensureFolder(segments.slice(0, -1)).push({
      type: 'file',
      name: segments[segments.length - 1],
      path,
    });
  });

  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    nodes.sort((a, b) =>
      a.type === b.type
        ? a.name.localeCompare(b.name)
        : a.type === 'folder'
          ? -1
          : 1,
    );
    nodes.forEach((node) => {
      if (node.type === 'folder') {
        sortNodes(node.children);
      }
    });
    return nodes;
  };

  return sortNodes(root);
}

export function folderItems(nodes: readonly FileTreeNode[]): FolderNode[] {
  return nodes.flatMap((node) =>
    node.type === 'folder' ? [node, ...folderItems(node.children)] : [],
  );
}

export function folderItemIds(nodes: readonly FileTreeNode[]): string[] {
  return folderItems(nodes).map((folder) => `${FOLDER_PREFIX}${folder.path}`);
}

export function joinPath(parent: string, name: string): string {
  return parent.length === 0 ? name : `${parent}/${name}`;
}

/**
 * The folder that contains the given path ('' for the workspace root).
 */
export function parentPath(path: string): string {
  const index = path.lastIndexOf('/');
  return index === -1 ? '' : path.slice(0, index);
}

/**
 * Whether a drag carries files from the user's device (and not, say, text).
 */
export function isFileDrag(event: DragEvent<HTMLElement>): boolean {
  return Array.from(event.dataTransfer.types).includes('Files');
}

/**
 * The folder a drag is currently over. Folder rows are marked with their own
 * path, file rows with the path of their parent folder, so dropping onto a
 * file uploads next to it. Anywhere else means the workspace root ('').
 */
export function dropFolderOf(target: EventTarget): string {
  if (!(target instanceof Element)) {
    return '';
  }
  return (
    target.closest<HTMLElement>('[data-drop-folder]')?.dataset.dropFolder ?? ''
  );
}
