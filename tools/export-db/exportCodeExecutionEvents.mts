/*
 * This script reconstructs from the events database all the files needed to execute Python code,
 * as done in the web platform. Files are exported to OUTPUT_DIR, and a folder is created for each
 * event.
 *
 * Example usage:
 * > npx cross-env NODE_OPTIONS=--experimental-wasm-modules ts-node -r dotenv/config tools/exportCodeExecutionEvents.mts -- dotenv_config_path=.env.local
 *
 * Use the appropriate environment file (e.g., .env.local) to set the database connection parameters.
 *
 * After the export, `python tools/executeExportedFiles.py` uses docker locally to execute the files.
 */

import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import sql from '../../src/db/dbConnection';
import {
  EXTRA_PYTHON_FILES_TABLE,
  TOOLBOX_FUNCTIONS_TABLE,
} from '../../src/db/events/codeExecutionEvent';
import {
  BareboneToolboxFunction,
  cellsToFiles,
  CODE_EXECUTION_CELLS_TO_FILES_VERSION,
} from '../../src/execution/codeExecution';
import { PythonFile } from '../../src/schemas/activitySchema';
import { EventName } from '../../src/storeDbEvent';

const EXPERIMENT_KEY = 'luce-members'; // or, e.g., 'pytamaro-summ%er-academy-2023'
const BEGIN_DATE = '2023-07-14 00:00:00';
const END_DATE = '2023-08-31 23:59:59';
const OUTPUT_DIR = 'out';
const EVENT_INFO_FILENAME = 'event.json';

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR);

  // Find all relevant code execution events (matching the experiment key and date range)
  const events =
    await sql`SELECT events.id, requested_cell_seq_number, python_mode FROM events
                             INNER JOIN events_code_execution ON events.id = events_code_execution.id
                             WHERE experiment_key LIKE ${EXPERIMENT_KEY}
                             AND event_type = ${EventName.CodeExecution}
                             AND created_at BETWEEN ${BEGIN_DATE} AND ${END_DATE}
                             AND cells_to_files_version = ${CODE_EXECUTION_CELLS_TO_FILES_VERSION};`;
  // Create a folder for each event and write the files used for the execution.
  // The files are derived from the sources of the code cells and the toolbox functions.
  await Promise.all(
    events.map(async (event) => {
      const sourcesObj = await sql`SELECT source FROM code_execution_sources
                                     INNER JOIN sources ON code_execution_sources.source_id = sources.id
                                     WHERE event_id = ${event.id}
                                     ORDER BY cell_seq_number ASC;`;
      const toolboxFunctions =
        (await sql`SELECT name, source FROM ${sql(TOOLBOX_FUNCTIONS_TABLE)}
                                           INNER JOIN sources ON ${sql(TOOLBOX_FUNCTIONS_TABLE)}.source_id = sources.id
                                           WHERE event_id = ${event.id};`) as BareboneToolboxFunction[];
      const extraPythonFiles =
        (await sql`SELECT name, source AS content FROM ${sql(EXTRA_PYTHON_FILES_TABLE)}
                                            INNER JOIN sources ON ${sql(EXTRA_PYTHON_FILES_TABLE)}.source_id = sources.id
                                            WHERE event_id = ${event.id};`) as PythonFile[];
      const files = cellsToFiles(
        sourcesObj.map((sourcesObj) => sourcesObj.source),
        event.requested_cell_seq_number,
        toolboxFunctions,
        extraPythonFiles,
        event.python_mode,
      );
      const eventFolder = join(OUTPUT_DIR, `${event.id}`);
      await mkdir(eventFolder);
      await Promise.all(
        files.map(async (file) => {
          writeFile(join(eventFolder, file.name), file.content);
        }),
      );
      const dockerImageObj = await sql`SELECT tag FROM docker_images
                                         INNER JOIN events_code_execution ON docker_images.id = events_code_execution.docker_image_id
                                         WHERE events_code_execution.id = ${event.id};`;
      writeFile(
        join(eventFolder, EVENT_INFO_FILENAME),
        JSON.stringify({
          dockerImage: dockerImageObj[0].tag,
          mainFile: files[0].name,
        }),
      );
    }),
  );

  // eslint-disable-next-line no-console
  console.log(
    `Exported files for ${events.length} events to the directory '${OUTPUT_DIR}'`,
  );

  await sql.end();
}

main();
