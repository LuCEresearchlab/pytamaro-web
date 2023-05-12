import postgres from 'postgres';
import { eventTableName, storeActivity, storeEvent } from './event';
import { storeOrRetrieveRow, storeRow, storeRowWithoutId } from '../dbUtils';
import { EventName } from '../../storeDbEvent';
import { ActivityVariant } from '../../schemas/activitySchema';
import conn from '../dbConnection';
import { CODE_EXECUTION_CELLS_TO_FILES_VERSION } from '../../codeExecution';

async function storeDockerImageTag(sql: postgres.TransactionSql, docker_image: string) {
  return storeOrRetrieveRow(sql, 'docker_images', { tag: docker_image });
}

async function storeSource(
  sql: postgres.TransactionSql,
  event_id: number,
  source: string,
  initial_source: string,
  cell_seq_number: number,
) {
  const SOURCES_TABLE = 'sources';
  const pSourceId = storeOrRetrieveRow(sql, SOURCES_TABLE, { source });
  const pInitialSourceId = storeOrRetrieveRow(sql, SOURCES_TABLE, { source: initial_source });
  storeRowWithoutId(sql, 'code_execution_sources', {
    event_id,
    source_id: await pSourceId,
    initial_source_id: await pInitialSourceId,
    cell_seq_number,
  });
}

async function storeEventCodeExecution(
  sql: postgres.TransactionSql,
  event_id: number,
  docker_image_id: number,
  activity_id: number,
  requested_cell_seq_number: number,
) {
  return storeRow(sql, eventTableName(EventName.CodeExecution), {
    id: event_id,
    docker_image_id,
    activity_id,
    requested_cell_seq_number,
    cells_to_files_version: CODE_EXECUTION_CELLS_TO_FILES_VERSION,
  });
}

export default async function saveCodeExecutionEvent(
  user_uuid: string,
  experiment_key: string,
  sources: string[],
  initial_sources: string[],
  activity_variant: ActivityVariant,
  docker_image: string,
  requested_cell_seq_number: number,
) : Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pDockerImageId = storeDockerImageTag(sql, docker_image);
      const pActivityId = storeActivity(sql, activity_variant);
      const pEventId = storeEvent(sql, user_uuid, experiment_key, EventName.CodeExecution);
      await storeEventCodeExecution(
        sql,
        await pEventId,
        await pDockerImageId,
        await pActivityId,
        requested_cell_seq_number,
      );
      await Promise.all(
        sources.map(async (source, idx) => storeSource(
          sql,
          await pEventId,
          source,
          initial_sources[idx],
          idx,
        )),
      );
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error while saving a code execution event', e);
    return false;
  }
}
