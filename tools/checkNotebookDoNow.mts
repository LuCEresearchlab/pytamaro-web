import { isMarkdownCell } from '../src/notebook';
import { JupyterCell } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { validateNotebooks } from './notebooksValidator.mts';
    
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

async function main() {
  await validateNotebooks(async (notebookPath: string, notebookCells: JupyterCell[]) => {
      const markdownCells = notebookCells.filter(isMarkdownCell);
      // Find <DoNow id="..."> tags in markdown cells and extract the id
      const doNowIds = markdownCells.map((cell: JupyterCell) => {
        return joinLines(cell.source).match(/<DoNow id="([^"]+)">/);
      }).filter(notEmpty).map((match: RegExpMatchArray) => match[1]);
      // Check no duplicate DoNow ids
      const uniqueDoNowIds = new Set(doNowIds);
      if (uniqueDoNowIds.size !== doNowIds.length) {
        console.error(`Duplicate DoNow ids found in notebook ${notebookPath}: ${doNowIds}`);
        return false;
      }
      return true;
    }
  );
}

main() 
