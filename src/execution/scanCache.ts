/**
 * Cheap change detection for the mid-run workspace scans.
 *
 * A mid-run scan only needs to find files whose content the client does not
 * have yet. A file whose size and modification time are the same as when its
 * content was last accounted for (seeded from the baseline, or read by an
 * earlier scan) can be skipped without reading it.
 *
 * This is a heuristic, so it is used only by incremental scans. The final scan
 * is a full byte comparison and never consults this cache: a wrong skip can
 * only cost timeliness, never data.
 */

export type ScanMode = 'full' | 'incremental';

export type FileSignature = { size: number; mtimeMs: number };

/**
 * The signature of an Emscripten `stat` result, or undefined if it has no
 * usable timestamp (in which case the file is always read: fail open).
 */
export function fileSignature(stat: {
  size: number;
  mtime: unknown;
}): FileSignature | undefined {
  // Works for both `Date` and numeric timestamps.
  const mtimeMs = Number(stat.mtime);
  return Number.isFinite(stat.size) && Number.isFinite(mtimeMs)
    ? { size: stat.size, mtimeMs }
    : undefined;
}

export class ScanCache {
  private readonly signatures = new Map<string, FileSignature>();

  clear(): void {
    this.signatures.clear();
  }

  /** Records a file whose current content the client already has. */
  remember(path: string, signature: FileSignature): void {
    this.signatures.set(path, signature);
  }

  /** Whether the file is unchanged since it was remembered. */
  isUnchanged(path: string, signature: FileSignature | undefined): boolean {
    const known = this.signatures.get(path);
    return (
      known !== undefined &&
      signature !== undefined &&
      known.size === signature.size &&
      known.mtimeMs === signature.mtimeMs
    );
  }

  /**
   * Commits a completed incremental scan: remembers the files it read and
   * forgets the ones that no longer exist, so a file deleted and recreated
   * is always read again.
   *
   * Called only after the whole walk succeeded, so that a scan that failed
   * halfway can never mark a file as reported when it was not.
   */
  commit(
    read: ReadonlyMap<string, FileSignature>,
    seen: ReadonlySet<string>,
  ): void {
    Array.from(this.signatures.keys()).forEach((path) => {
      if (!seen.has(path)) {
        this.signatures.delete(path);
      }
    });
    read.forEach((signature, path) => this.signatures.set(path, signature));
  }
}
