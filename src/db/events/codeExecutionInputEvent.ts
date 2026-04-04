import postgres from 'postgres';
import { EventName } from '../../storeDbEvent';
import conn from '../dbConnection';
import { storeRow } from '../dbUtils';
import { eventTableName, storeEvent } from './event';

export const TOOLBOX_FUNCTIONS_TABLE = 'code_execution_toolbox_functions';
export const EXTRA_PYTHON_FILES_TABLE = 'code_execution_extra_python_files';

async function storeEventCodeExecutionInput(
  sql: postgres.TransactionSql,
  event_id: number,
  executionUUID: string,
  seq: number,
  content: string,
) {
  return storeRow(sql, eventTableName(EventName.CodeExecutionInput), {
    id: event_id,
    execution_uuid: executionUUID,
    seq,
    content,
  });
}

export default async function saveCodeExecutionInputEvent(
  user_uuid: string,
  experiment_key: string,
  executionUUID: string,
  seq: number,
  content: string,
): Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pEventId = storeEvent(
        sql,
        user_uuid,
        experiment_key,
        EventName.CodeExecutionInput,
      );
      await storeEventCodeExecutionInput(
        sql,
        await pEventId,
        executionUUID,
        seq,
        content,
      );
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error while saving a code execution input event', e);
    return false;
  }
}
