import fs from 'fs';
import path from 'path';
import { start, parse } from './parser-nodejs/parser.js';
import { JupyterCell } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils.js';
import { DATA_DIR, ACTIVITIES_DIR } from './utils.mjs';

async function main() {
  let errors = 0;
  start()
  // List all authors
  const authorSlugs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  authorSlugs.forEach(async (authorSlug) => {
    const authorPath = path.join(DATA_DIR, authorSlug);
    // List all activities
    const activitySlugs = (fs.readdirSync(
      path.join(authorPath, ACTIVITIES_DIR),
      { withFileTypes: true },
    ))
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    // List all notebooks
    activitySlugs.forEach(async (activitySlug) => {
      const activityPath = path.join(authorPath, ACTIVITIES_DIR, activitySlug);
      const notebookFiles = (fs.readdirSync(activityPath, { withFileTypes: true }))
        .filter((item) => item.isFile() && item.name.endsWith('.ipynb'));

      // For each notebook, extract source code cells
      notebookFiles.forEach(async (notebookFile) => {
        const notebookPath = path.join(activityPath, notebookFile.name);
        const notebookContent = JSON.parse(fs.readFileSync(notebookPath, 'utf-8'));
        const sourceCodeCells = notebookContent.cells.filter((cell: JupyterCell) => cell.cell_type === 'code')
          .map((cell: JupyterCell) => joinLines(cell.source));
        sourceCodeCells.forEach((sourceCodeCell: string, idx: number) => {
          try {
            parse(sourceCodeCell);
          } catch (e) {
            console.error(`Failed to parse Python code cell ${idx} in notebook ${notebookPath}: ${e}`);
            errors++;
          }
        });
      });
    });
  });
  process.exit(errors === 0 ? 0 : 1);
}

main() 
