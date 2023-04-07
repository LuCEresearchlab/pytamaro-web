import { readFile } from 'fs/promises';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import { MODULES_PATH } from './Modules';

const TEACHER_ONLY_CELL_PREFIX = '#teacher-only';
const STUDENT_TEACHER_CELL_PREFIX = '#student-teacher';

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

type User = 'teacher' | 'student';

interface NotebookOtherCell extends NotebookGeneralCell {
  cell_type: 'code' | 'raw',
}

export type NotebookCell = NotebookMarkdownCell | NotebookOtherCell;

function filterNotebookCells(
  cells: any,
  user: User,
) {
  return cells.filter((cell: any) => {
    const trimmedFirstLine = cell.source.join('').split('\n')[0].trimStart();
    return (user !== 'student'
        || trimmedFirstLine !== TEACHER_ONLY_CELL_PREFIX)
      && (user === 'student'
        || trimmedFirstLine === TEACHER_ONLY_CELL_PREFIX
        || trimmedFirstLine === STUDENT_TEACHER_CELL_PREFIX);
  });
}

function cleanCellSource(src: string[]) {
  return src.join('').split('\n').filter((line) => {
    const trimmedLine = line.trimStart();
    return trimmedLine !== TEACHER_ONLY_CELL_PREFIX && trimmedLine !== STUDENT_TEACHER_CELL_PREFIX;
  }).join('\n');
}

export async function getNotebookContent(
  slug: string,
  language: string,
  version: string,
  user: User,
) : Promise<NotebookCell[]> {
  const notebookPath = path.join(MODULES_PATH, slug, `${slug}-${language}-${version}.ipynb`);
  const contentBuffer = await readFile(notebookPath);
  const content = JSON.parse(contentBuffer.toString());
  content.cells = filterNotebookCells(content.cells, user);
  return Promise.all(content.cells.map(async (cell: any, idx: number) => {
    const annotatedCell = {
      ...cell,
      source: cleanCellSource(cell.source),
      id: idx.toString(),
    };
    if (cell.cell_type === 'markdown') {
      annotatedCell.mdxSource = await serialize(annotatedCell.source);
    }
    return annotatedCell;
  }));
}
