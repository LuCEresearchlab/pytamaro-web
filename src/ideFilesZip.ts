import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { fileFromBytes, IdeFile } from './ideFiles';

/** Downloads the given files as a zip archive. */
export async function downloadFilesAsZip(
  files: readonly IdeFile[],
): Promise<void> {
  const zip = new JSZip();
  files.forEach(({ path, content }) => zip.file(path, content));
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'sources.zip');
}

/**
 * Reads the files contained in a zip archive.
 *
 * Directory entries are dropped, but the files keep their relative paths.
 * Archive metadata is skipped.
 */
export async function readFilesFromZip(archive: File): Promise<IdeFile[]> {
  const zip = await JSZip.loadAsync(archive);
  const files: IdeFile[] = [];
  const seenPaths = new Set<string>();
  for (const entry of Object.values(zip.files)) {
    if (entry.dir || entry.name.startsWith('__MACOSX/')) {
      continue;
    }
    const path = entry.name.replace(/^\/+/, '');
    if (
      path.length === 0 ||
      path
        .split('/')
        .some((segment) => segment === '..' || segment.startsWith('._')) ||
      seenPaths.has(path)
    ) {
      continue;
    }
    seenPaths.add(path);
    const bytes = await entry.async('uint8array');
    files.push(fileFromBytes(path, bytes));
  }
  return files;
}
