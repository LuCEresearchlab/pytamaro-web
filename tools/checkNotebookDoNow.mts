import { slug } from 'github-slugger';
import { isMarkdownCell } from '../src/notebook';
import { JupyterCell } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { validateNotebooks } from './notebooksValidator.mts';

async function main() {
  await validateNotebooks(
    async (notebookPath: string, notebookCells: JupyterCell[]) => {
      const markdownCells = notebookCells.filter(isMarkdownCell);
      // Find <DoNow id="..."> tags in markdown cells and extract the id
      const doNowIds = markdownCells
        .flatMap((cell: JupyterCell) => {
          return Array.from(
            joinLines(cell.source).matchAll(/<DoNow id="([^"]+)">/g),
          );
        })
        .map((match: RegExpMatchArray) => match[1])
        .map((id) => slug(id, true));
      // Check that there are no duplicate DoNow ids (after slugging)
      const uniqueDoNowIds = new Set(doNowIds);
      if (uniqueDoNowIds.size !== doNowIds.length) {
        console.error(
          `Duplicate DoNow ids found in notebook ${notebookPath}: ${doNowIds}`,
        );
        return false;
      }
      return true;
    },
  );
}

main();
