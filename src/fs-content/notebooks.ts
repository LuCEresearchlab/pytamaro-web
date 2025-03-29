import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { JupyterCell } from '../schemas/activitySchema';

export const DATA_DIR = 'data';
export const ACTIVITIES_DIR = 'activities';

export async function readNotebookContent(
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
): Promise<JupyterCell[]> {
  const notebookPath = path.join(
    DATA_DIR,
    authorSlug,
    ACTIVITIES_DIR,
    activitySlug,
    `${activitySlug}-${language}-${version}.ipynb`,
  );
  const contentBuffer = await readFile(notebookPath);
  return JSON.parse(contentBuffer.toString()).cells;
}

export async function notebookFileNames(
  authorSlug: string,
  activitySlug: string,
): Promise<string[]> {
  const suffix = '.ipynb';
  const notebooks = (
    await readdir(path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug))
  ).filter((file) => file.endsWith(suffix));
  return notebooks.map((filename) => filename.replace(suffix, ''));
}
