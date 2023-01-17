import { readFile } from 'fs/promises';
import path from 'path';

const GENERATED_NOTEBOOK_DIR = 'generated_notebooks';

export interface ContentItem {
  name: string,
  path: string
  type: string
}

export interface NotebookCell {
  id: string,
  cell_type: string,
  source: string,
  attachments?: any,
}

export async function getNotebookContent(
  slug: string,
  language: string,
  target: string,
  version: string,
) {
  const notebookPath = path.join(GENERATED_NOTEBOOK_DIR, slug, `${slug}-${language}-${target}-${version}.ipynb`);
  const contentBuffer = await readFile(notebookPath);
  const content = JSON.parse(contentBuffer.toString());
  return content.cells.map((cell: any, idx: number) => ({ ...cell, source: cell.source.join(''), id: idx.toString() }));
}
