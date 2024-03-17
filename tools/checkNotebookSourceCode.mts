import { isCodeCell } from '../src/notebook';
import { parse } from '../src/python-analyzer/python_analyzer';
import { JupyterCell } from "../src/schemas/activitySchema";
import { joinLines } from '../src/sourceUtils';
import { validateNotebooks } from "./notebooksValidator.mts";

async function main() {
  await validateNotebooks(async (notebookPath: string, notebookCells: JupyterCell[]) => {
    const sourceCodeCells = notebookCells.filter(isCodeCell).map((cell: JupyterCell) => joinLines(cell.source));
    return sourceCodeCells.map((sourceCodeCell: string, idx: number) => {
      try {
        parse(sourceCodeCell);
        return true;
      } catch (e) {
        console.error(`Failed to parse Python code cell ${idx} in notebook ${notebookPath}: ${e}`);
        return false;
      }
    }).every(v => v === true);
  });
}

main() 
