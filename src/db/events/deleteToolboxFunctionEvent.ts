import postgres from 'postgres';
import { EventName } from '../../storeDbEvent';
import conn from '../dbConnection';
import { storeRow } from '../dbUtils';
import { eventTableName, storeEvent } from './event';

async function storeEventDeleteToolboxFunction(
  sql: postgres.TransactionSql,
  event_id: number,
  name: string,
) {
  return storeRow(sql, eventTableName(EventName.DeleteToolboxFunction), {
    id: event_id,
    name,
  });
}

export default async function saveDeleteToolboxFunctionEvent(
  user_uuid: string,
  experiment_key: string,
  name: string,
): Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pEventId = storeEvent(
        sql,
        user_uuid,
        experiment_key,
        EventName.DeleteToolboxFunction,
      );
      await storeEventDeleteToolboxFunction(sql, await pEventId, name);
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error while saving a delete toolbox function event', e);
    return false;
  }
}
