import { readFile } from 'fs/promises';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import { MODULES_PATH } from './Modules';

export interface ContentItem {
  name: string,
  path: string
  type: string
}

interface NotebookGeneralCell {
  id: string,
  source: string,
  attachments?: any,
}

interface NotebookMarkdownCell extends NotebookGeneralCell {
  cell_type: 'markdown',
  mdxSource: MDXRemoteSerializeResult,
}

interface NotebookOtherCell extends NotebookGeneralCell {
  cell_type: 'code' | 'raw',
}

export type NotebookCell = NotebookMarkdownCell | NotebookOtherCell;

export async function getNotebookContent(
  slug: string,
  language: string,
  version: string,
) {
  const notebookPath = path.join(MODULES_PATH, slug, `${slug}-${language}-${version}.ipynb`);
  const contentBuffer = await readFile(notebookPath);
  const content = JSON.parse(contentBuffer.toString());
  return Promise.all(content.cells.map(async (cell: any, idx: number) => ({
    ...cell,
    source: cell.source.join(''),
    mdxSource: cell.cell_type === 'markdown' ? await serialize(cell.source.join('')) : null,
    id: idx.toString(),
  })));
}
