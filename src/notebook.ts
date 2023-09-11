import { serialize } from 'next-mdx-remote/serialize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { readNotebookContent } from './fs-content/notebooks';
import { JupyterCell, NotebookCell } from './schemas/activitySchema';

const TEACHER_ONLY_CELL_PREFIX = '#teacher-only';
const STUDENT_TEACHER_CELL_PREFIX = '#student-teacher';

const KNOWN_PREFIXES = [
  TEACHER_ONLY_CELL_PREFIX,
  STUDENT_TEACHER_CELL_PREFIX,
];

export type User = 'teacher' | 'student';

export function isCodeCell(cell: JupyterCell) {
  return cell.cell_type === 'code';
}

export function cellsVisibleToUser(
  cells: JupyterCell[],
  user: User,
) {
  return cells.filter((cell) => {
    if (!isCodeCell(cell)) {
      // Only code cells can be hidden
      return true;
    }
    const specialTag = cell.source[0]?.trim();
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

export default async function getNotebookContent(
  authorSlug: string,
  activitySlug: string,
  language: string,
  version: string,
  user: User,
) : Promise<NotebookCell[]> {
  const cells = await readNotebookContent(authorSlug, activitySlug, language, version);
  return Promise.all(cellsVisibleToUser(cells, user).map(async (cell, idx) => {
    const source = cleanCellSource(cell.source);
    return {
      ...cell,
      source,
      id: idx.toString(),
      mdxSource: cell.cell_type === 'markdown' ? await serialize(source, {
        mdxOptions: {
          rehypePlugins: [rehypeSlug],
          remarkPlugins: [remarkGfm],
        },
      }) : null,
    };
  }));
}
