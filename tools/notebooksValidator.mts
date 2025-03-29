import fs from 'fs';
import path from 'path';
import { JupyterCell } from '../src/schemas/activitySchema.js';
import { ACTIVITIES_DIR, DATA_DIR } from './utils.mjs';

export async function validateNotebooks(
  isValid: (
    notebookPath: string,
    notebookContent: JupyterCell[],
  ) => Promise<boolean>,
) {
  let errors = 0;
  // List all authors
  const authorSlugs = fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
  authorSlugs.forEach(async (authorSlug) => {
    const authorPath = path.join(DATA_DIR, authorSlug);
    // List all activities
    const activitySlugs = fs
      .readdirSync(path.join(authorPath, ACTIVITIES_DIR), {
        withFileTypes: true,
      })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    // List all notebooks
    activitySlugs.forEach(async (activitySlug) => {
      const activityPath = path.join(authorPath, ACTIVITIES_DIR, activitySlug);
      const notebookFiles = fs
        .readdirSync(activityPath, { withFileTypes: true })
        .filter((item) => item.isFile() && item.name.endsWith('.ipynb'));

      // For each notebook, extract markdown cells
      notebookFiles.forEach(async (notebookFile) => {
        const notebookPath = path.join(activityPath, notebookFile.name);
        const notebookContent = JSON.parse(
          fs.readFileSync(notebookPath, 'utf-8'),
        );
        errors += (await isValid(notebookPath, notebookContent.cells)) ? 0 : 1;
      });
    });
  });
  process.exit(errors === 0 ? 0 : 1);
}
