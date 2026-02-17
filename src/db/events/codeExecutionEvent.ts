import postgres from 'postgres';
import { CODE_EXECUTION_CELLS_TO_FILES_VERSION } from '../../codeExecution';
import { LiveAnalysisStatus, ToolboxFunction } from '../../localStorage/schema';
import { ActivityVariant, PythonFile } from '../../schemas/activitySchema';
import { EventName } from '../../storeDbEvent';
import conn from '../dbConnection';
import { storeOrRetrieveRow, storeRow, storeRowWithoutId } from '../dbUtils';
import {
  eventTableName,
  storeActivity,
  storeEvent,
  storeSource,
} from './event';

async function storeDockerImageTag(
  sql: postgres.TransactionSql,
  docker_image: string,
) {
  return storeOrRetrieveRow(sql, 'docker_images', { tag: docker_image });
}

export const TOOLBOX_FUNCTIONS_TABLE = 'code_execution_toolbox_functions';
export const EXTRA_PYTHON_FILES_TABLE = 'code_execution_extra_python_files';

async function storeFile(
  sql: postgres.TransactionSql,
  event_id: number,
  table: string,
  name: string,
  source: string,
) {
  const pSourceId = storeSource(sql, source);
  storeRowWithoutId(sql, table, {
    event_id,
    name,
    source_id: await pSourceId,
  });
}

async function storeCell(
  sql: postgres.TransactionSql,
  event_id: number,
  source: string,
  initial_source: string,
  cell_seq_number: number,
) {
  const pSourceId = storeSource(sql, source);
  const pInitialSourceId = storeSource(sql, initial_source);
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
  live_analysis: LiveAnalysisStatus,
  executionUUID: string,
) {
  return storeRow(sql, eventTableName(EventName.CodeExecution), {
    id: event_id,
    docker_image_id,
    activity_id,
    requested_cell_seq_number,
    cells_to_files_version: CODE_EXECUTION_CELLS_TO_FILES_VERSION,
    live_analysis,
    execution_uuid: executionUUID,
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
  toolboxFunctions: ToolboxFunction[],
  extraPythonFiles: PythonFile[],
  liveAnalysis: LiveAnalysisStatus,
  executionUUID: string,
): Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pDockerImageId = storeDockerImageTag(sql, docker_image);
      const pActivityId = storeActivity(sql, activity_variant);
      const pEventId = storeEvent(
        sql,
        user_uuid,
        experiment_key,
        EventName.CodeExecution,
      );
      await storeEventCodeExecution(
        sql,
        await pEventId,
        await pDockerImageId,
        await pActivityId,
        requested_cell_seq_number,
        liveAnalysis,
        executionUUID,
      );
      await Promise.all(
        [
          sources.map(async (source, idx) =>
            storeCell(sql, await pEventId, source, initial_sources[idx], idx),
          ),
          toolboxFunctions.map(async (fn) =>
            storeFile(
              sql,
              await pEventId,
              TOOLBOX_FUNCTIONS_TABLE,
              fn.name,
              fn.source,
            ),
          ),
          extraPythonFiles.map(async (file) =>
            storeFile(
              sql,
              await pEventId,
              EXTRA_PYTHON_FILES_TABLE,
              file.name,
              file.content,
            ),
          ),
        ].flat(),
      );
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error while saving a code execution event', e);
    return false;
  }
}
