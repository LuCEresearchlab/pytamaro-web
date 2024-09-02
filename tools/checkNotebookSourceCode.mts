import { isCodeCell } from '../src/notebook';
import { analyze, ParseError } from '../src/python-analyzer/python_analyzer';
import { JupyterCell } from "../src/schemas/activitySchema";
import { joinLines } from '../src/sourceUtils';
import { validateNotebooks } from "./notebooksValidator.mts";

async function main() {
  await validateNotebooks(async (notebookPath: string, notebookCells: JupyterCell[]) => {
    const sourceCodeCells = notebookCells.filter(isCodeCell).map((cell: JupyterCell) => joinLines(cell.source));
    return sourceCodeCells.map((sourceCodeCell: string, idx: number) => {
      const parseErrors = analyze(sourceCodeCell).parse_errors;
      if (parseErrors.length === 0) {
        return true;
      }
      console.error(`Failed to parse Python code cell ${idx} in notebook ${notebookPath}:`);
      parseErrors.forEach((error: ParseError) => {
        console.error(`  ${error.message} at range ${error.location}`);
      }); 
    }).every(v => v === true);
  });
}

main() 
