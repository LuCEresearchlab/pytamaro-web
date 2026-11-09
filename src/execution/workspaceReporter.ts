import { sameBytes } from '../ideFileContent';
import type { WorkspaceChanges, WorkspaceFileChange } from './messageTypes';
import { mergeWorkspaceChanges } from './workspaceChanges';
import { isRunArtifact } from './workspacePaths';

/** A single filesystem change observed inside the Python worker. */
export type WorkspaceEvent =
  | { kind: 'put'; name: string; content: Uint8Array }
  | { kind: 'remove'; name: string }
  | { kind: 'folders'; folders: string[] };

/**
 * Whether two folder lists contain the same paths (ignoring order).
 */
function sameFolders(a: ReadonlySet<string>, b: readonly string[]): boolean {
  return a.size === b.length && b.every((name) => a.has(name));
}

/**
 * Decides which filesystem changes the main thread does not know about yet.
 *
 * A mid-run message is advisory: dropping or losing one must only cost
 * timeliness, never data. The reporter therefore remembers what it has pushed
 * in its own `pushed` map and never touches the run's baseline (I3). The final
 * reconciliation still compares against the untouched baseline, so files whose
 * mid-run event was lost are reported then.
 *
 * This class is pure: it does not know about Emscripten or `postMessage`.
 */
export class WorkspaceReporter {
  private readonly baseline: ReadonlyMap<string, Uint8Array>;
  private readonly generatedFiles: ReadonlySet<string>;
  private readonly baselineFolders: ReadonlySet<string>;
  /**
   * What the main thread knows: the baseline overlaid with everything reported
   * so far. `null` means "reported deleted".
   */
  private readonly pushed = new Map<string, Uint8Array | null>();
  /** The empty-folder set that the main thread currently has. */
  private pushedFolders: ReadonlySet<string>;

  constructor(
    baseline: ReadonlyMap<string, Uint8Array>,
    generatedFiles: ReadonlySet<string>,
    baselineFolders: readonly string[] = [],
  ) {
    this.baseline = baseline;
    this.generatedFiles = generatedFiles;
    this.baselineFolders = new Set(baselineFolders);
    this.pushedFolders = this.baselineFolders;
  }

  /** Ingests raw hook events and returns the changes not reported yet. */
  ingest(events: readonly WorkspaceEvent[]): WorkspaceChanges | null {
    const pending = new Map<string, Uint8Array | null>();
    let folders: string[] | undefined;

    for (const event of events) {
      if (event.kind === 'folders') {
        const next = event.folders.filter(
          (name) => !this.isIgnoredFolder(name),
        );
        if (sameFolders(this.pushedFolders, next)) {
          continue;
        }
        this.pushedFolders = new Set(next);
        folders = next;
        continue;
      }
      const { name } = event;
      if (this.isIgnored(name)) {
        continue;
      }
      if (event.kind === 'put') {
        const known = this.known(name);
        if (
          known !== null &&
          known !== undefined &&
          sameBytes(known, event.content)
        ) {
          continue;
        }
        this.pushed.set(name, event.content);
        pending.set(name, event.content);
      } else {
        const known = this.known(name);
        if (known === null || known === undefined) {
          continue;
        }
        this.pushed.set(name, null);
        pending.set(name, null);
      }
    }

    const changes = toChanges(pending);
    if (folders === undefined) {
      return changes;
    }
    return changes === null
      ? { changed: [], deleted: [], folders }
      : { ...changes, folders };
  }

  /**
   * Ingests a scan result computed relative to the baseline (as produced by
   * `collectWorkspaceChanges`) and returns what was not reported yet.
   */
  ingestScan(scan: WorkspaceChanges): WorkspaceChanges | null {
    const events: WorkspaceEvent[] = [
      ...scan.changed.map(
        ({ name, content }): WorkspaceEvent => ({ kind: 'put', name, content }),
      ),
      ...scan.deleted.map((name): WorkspaceEvent => ({ kind: 'remove', name })),
    ];
    if (scan.folders !== undefined) {
      events.push({ kind: 'folders', folders: scan.folders });
    }
    return this.ingest(events);
  }

  /**
   * Makes a final scan cumulative with respect to mid-run pushes.
   *
   * `scan` compares the filesystem with the untouched baseline. The UI, however,
   * may already have applied mid-run pushes. A file that was pushed and then
   * reverted to its baseline content (or deleted and recreated identically) is
   * absent from `scan`, so the UI would keep the pushed state. Any path that was
   * pushed but is not mentioned by the scan is therefore restored to its actual
   * final state. Applying the extra changes is idempotent, so this cannot hurt
   * when the pushes were lost.
   */
  reconcile(scan: WorkspaceChanges): WorkspaceChanges {
    const mentioned = new Set<string>();
    scan.changed.forEach(({ name }) => mentioned.add(name));
    scan.deleted.forEach((name) => mentioned.add(name));

    const changed: WorkspaceFileChange[] = [];
    const deleted: string[] = [];
    this.pushed.forEach((_content, name) => {
      if (mentioned.has(name)) {
        return;
      }
      const baseline = this.baseline.get(name);
      if (baseline === undefined) {
        // Created during the run and no longer present.
        deleted.push(name);
      } else {
        // Absent from the scan means the final content equals the baseline.
        changed.push({ name, content: baseline });
      }
    });

    return changed.length === 0 && deleted.length === 0
      ? scan
      : mergeWorkspaceChanges(scan, { changed, deleted });
  }

  private isIgnored(name: string): boolean {
    // Generated files are not part of the workspace at all.
    if (this.generatedFiles.has(name)) {
      return true;
    }
    // Baseline files are always tracked, even when their path looks like an
    // artifact (e.g. an imported `.env`).
    return !this.baseline.has(name) && isRunArtifact(name);
  }

  private isIgnoredFolder(name: string): boolean {
    // Baseline folders are always tracked, even when their path looks like an
    // artifact.
    return !this.baselineFolders.has(name) && isRunArtifact(name);
  }

  private known(name: string): Uint8Array | null | undefined {
    return this.pushed.has(name)
      ? this.pushed.get(name)
      : this.baseline.get(name);
  }
}

function toChanges(
  pending: ReadonlyMap<string, Uint8Array | null>,
): WorkspaceChanges | null {
  if (pending.size === 0) {
    return null;
  }
  const changed: WorkspaceFileChange[] = [];
  const deleted: string[] = [];
  pending.forEach((content, name) => {
    if (content === null) {
      deleted.push(name);
    } else {
      changed.push({ name, content });
    }
  });
  return { changed, deleted };
}
