import type { WorkspaceChanges, WorkspaceFileChange } from './messageTypes';

/**
 * Merges two batches of workspace changes with last-wins-per-path semantics.
 *
 * Mid-run changes arrive in batches and the same path may be touched by several
 * of them (and again by the final result). A path is kept in exactly one of
 * `changed` and `deleted`, so applying the result cannot both write and remove
 * it regardless of the order in which the workspace applies the lists.
 */
export function mergeWorkspaceChanges(
  pending: WorkspaceChanges | null,
  incoming: WorkspaceChanges,
): WorkspaceChanges {
  const merged = new Map<string, WorkspaceFileChange | null>();
  const add = (changes: WorkspaceChanges) => {
    changes.changed.forEach((change) => merged.set(change.name, change));
    changes.deleted.forEach((name) => merged.set(name, null));
  };
  if (pending !== null) {
    add(pending);
  }
  add(incoming);

  const changed: WorkspaceFileChange[] = [];
  const deleted: string[] = [];
  merged.forEach((change, name) => {
    if (change === null) {
      deleted.push(name);
    } else {
      changed.push(change);
    }
  });

  // Folder lists are complete snapshots: the incoming one wins when present.
  const folders = incoming.folders ?? pending?.folders;
  return folders === undefined
    ? { changed, deleted }
    : { changed, deleted, folders };
}

/** Whether a batch contains no changes at all. */
export function isEmptyWorkspaceChanges(changes: WorkspaceChanges): boolean {
  return (
    changes.changed.length === 0 &&
    changes.deleted.length === 0 &&
    changes.folders === undefined
  );
}
