import postgres from 'postgres';
import { EventName } from '../../storeDbEvent';
import conn from '../dbConnection';
import { storeRow } from '../dbUtils';
import { eventTableName, storeEvent } from './event';

export const TOOLBOX_FUNCTIONS_TABLE = 'code_execution_toolbox_functions';
export const EXTRA_PYTHON_FILES_TABLE = 'code_execution_extra_python_files';

async function storeEventCodeExecutionErrorsWarning(
  sql: postgres.TransactionSql,
  event_id: number,
  executionUUID: string,
  forced_execution: boolean,
) {
  return storeRow(sql, eventTableName(EventName.CodeExecutionErrorsWarning), {
    id: event_id,
    execution_uuid: executionUUID,
    forced_execution,
  });
}

export default async function saveCodeExecutionErrorsWarningEvent(
  user_uuid: string,
  experiment_key: string,
  executionUUID: string,
  forced_execution: boolean,
): Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pEventId = storeEvent(
        sql,
        user_uuid,
        experiment_key,
        EventName.CodeExecutionErrorsWarning,
      );
      await storeEventCodeExecutionErrorsWarning(
        sql,
        await pEventId,
        executionUUID,
        forced_execution,
      );
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      'Error while saving a code execution errors warning event',
      e,
    );
    return false;
  }
}
