import postgres from 'postgres';
import { ToolboxFunction } from '../../localStorage/schema';
import { EventName } from '../../storeDbEvent';
import conn from '../dbConnection';
import { storeRow } from '../dbUtils';
import {
  eventTableName,
  storeActivity,
  storeEvent,
  storeSource,
} from './event';

async function storeEventAddToolboxFunction(
  sql: postgres.TransactionSql,
  event_id: number,
  name: string,
  description: string,
  source_id: number,
  usage_source_id: number,
  original_activity_id: number,
) {
  return storeRow(sql, eventTableName(EventName.AddToolboxFunction), {
    id: event_id,
    name,
    description,
    source_id,
    usage_source_id,
    original_activity_id,
  });
}

export default async function saveAddToolboxFunctionEvent(
  user_uuid: string,
  experiment_key: string,
  fn: ToolboxFunction,
): Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pEventId = storeEvent(
        sql,
        user_uuid,
        experiment_key,
        EventName.AddToolboxFunction,
      );
      const pSourceId = storeSource(sql, fn.source);
      const pUsageSourceId = storeSource(sql, fn.usage);
      const pOriginalActivityId = storeActivity(sql, fn.originalActivity);
      await storeEventAddToolboxFunction(
        sql,
        await pEventId,
        fn.name,
        fn.description,
        await pSourceId,
        await pUsageSourceId,
        await pOriginalActivityId,
      );
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error while saving an add toolbox function event', e);
    return false;
  }
}
