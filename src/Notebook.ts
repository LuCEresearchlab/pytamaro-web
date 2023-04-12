import { readFile } from 'fs/promises';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import { DATA_DIR, ACTIVITIES_DIR } from './Activities';

const TEACHER_ONLY_CELL_PREFIX = '#teacher-only';
const STUDENT_TEACHER_CELL_PREFIX = '#student-teacher';

const KNOWN_PREFIXES = [
  TEACHER_ONLY_CELL_PREFIX,
  STUDENT_TEACHER_CELL_PREFIX,
];

export interface ContentItem {
  name: string,
  path: string
  type: string
}

type CellType = 'code' | 'markdown' | 'raw';

interface JupyterCell {
  id: string,
  source: string[],
  attachments?: any,
  cell_type: CellType,
}

export interface NotebookCell {
  id: string,
  source: string,
  attachments?: any,
  cell_type: CellType,
}

export interface MarkdownCell extends NotebookCell {
  cell_type: 'markdown',
  mdxSource: MDXRemoteSerializeResult,
}

type User = 'teacher' | 'student';

function cellsVisibleToUser(
  cells: JupyterCell[],
  user: User,
) {
  return cells.filter((cell) => {
    if (cell.cell_type !== 'code') {
      // Only code cells can be hidden
      return true;
    }
    const specialTag = cell.source[0].trim();
    if (user === 'student') {
      return specialTag !== TEACHER_ONLY_CELL_PREFIX;
    }
    // teacher
    return specialTag === TEACHER_ONLY_CELL_PREFIX || specialTag === STUDENT_TEACHER_CELL_PREFIX;
  });
}

function cleanCellSource(source: string[]) {
  // Remove the first line if it's a known tag
  return source
    .filter((line, idx) => idx > 0 || !KNOWN_PREFIXES.includes(line.trim()))
    .join('');
}

export async function getNotebookContent(
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
  user: User,
) : Promise<NotebookCell[]> {
  const notebookPath = path.join(DATA_DIR, authorSlug, ACTIVITIES_DIR, activitySlug, `${activitySlug}-${language}-${version}.ipynb`);
  const contentBuffer = await readFile(notebookPath);
  const content = JSON.parse(contentBuffer.toString());
  return Promise.all(cellsVisibleToUser(content.cells, user).map(async (cell, idx) => {
    const source = cleanCellSource(cell.source);
    return {
      ...cell,
      source,
      id: idx.toString(),
      mdxSource: cell.cell_type === 'markdown' ? await serialize(source) : null,
    };
  }));
}
