import { readFile } from 'fs/promises';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import { DATA_DIR, ACTIVITIES_DIR } from './Activities';

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
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
) : Promise<NotebookCell[]> {
  const notebookPath = path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug, `${activitySlug}-${language}-${version}.ipynb`);
  const contentBuffer = await readFile(notebookPath);
  const content = JSON.parse(contentBuffer.toString());
  return Promise.all(content.cells.map(async (cell: any, idx: number) => {
    const annotatedCell = {
      ...cell,
      source: cell.source.join(''),
      id: idx.toString(),
    };
    if (cell.cell_type === 'markdown') {
      annotatedCell.mdxSource = await serialize(annotatedCell.source);
    }
    return annotatedCell;
  }));
}
