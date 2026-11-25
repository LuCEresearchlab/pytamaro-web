/**
 * Paths that Python creates as a side effect of running code in the workspace
 * (byte-code caches, hidden files) and that must not be reported to the IDE.
 *
 * This is the single source of truth for the filter, used both by the mid-run
 * reporter and by the end-of-run collector. Note that a file that was already
 * part of the workspace when the run started is always tracked, even if its
 * path looks like an artifact (e.g. an imported `.env`): otherwise it would be
 * reported as deleted.
 */
export function isRunArtifact(path: string): boolean {
  return (
    path
      .split('/')
      .some((segment) => segment.startsWith('.') || segment === '__pycache__') ||
    path.endsWith('.pyc') ||
    path.endsWith('.pyo')
  );
}
