/* eslint-disable no-console */
/*
 Simplifed version of exportCodeExecutionEvents, focused on a simple extraction
 (playground, no toolbox functions).
 Exported files are also be type-checked with `ty`.
 */
import { exec } from 'child_process';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import sql from '../../src/db/dbConnection.ts';
import { TOOLBOX_FUNCTIONS_TABLE } from '../../src/db/events/codeExecutionEvent.ts';
import { BareboneToolboxFunction } from '../../src/execution/codeExecution.ts';
import { EventName } from '../../src/storeDbEvent.ts';

const BEGIN_DATE = '2025-12-10 18:00:00';
const END_DATE = '2026-01-01 00:00:00';
const OUTPUT_DIR = 'out';

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR);

  // Find playground activity id
  const playgroundActivity =
    await sql`SELECT id FROM activities WHERE author_slug = 'luce' AND activity_slug = 'playground';`;
  if (playgroundActivity.length !== 1) {
    throw new Error('Playground activity not found');
  }
  const playgroundActivityId = playgroundActivity[0].id;

  // Find all relevant code execution events (matching the experiment key and date range)
  let eventsWithToolboxCount = 0;
  let eventsSaved = 0;
  const events =
    await sql`SELECT events.id, requested_cell_seq_number FROM events
                             INNER JOIN events_code_execution ON events.id = events_code_execution.id
                             WHERE event_type = ${EventName.CodeExecution}
                             AND created_at BETWEEN ${BEGIN_DATE} AND ${END_DATE}
                             AND activity_id = ${playgroundActivityId};`;

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
      if (toolboxFunctions.length !== 0) {
        eventsWithToolboxCount += 1;
        return;
      }
      if (sourcesObj.length !== 1) {
        throw new Error('unexpected number of cells for event' + event.id);
      }
      await writeFile(join(OUTPUT_DIR, `${event.id}.py`), sourcesObj[0].source);
      exec(
        `uvx ty check ${event.id}.py --extra-search-path ~/repos/pytamaro --output-format concise > ${event.id}_typecheck.txt`,
        {
          cwd: OUTPUT_DIR,
        },
      );
      eventsSaved += 1;
    }),
  );

  console.log(`Total events found: ${events.length}`);
  console.log(`Events saved: ${eventsSaved}`);
  console.log(`Events skipped (with toolbox): ${eventsWithToolboxCount}`);

  await sql.end();
}

main();
