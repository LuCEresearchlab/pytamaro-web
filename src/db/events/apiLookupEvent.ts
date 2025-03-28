import postgres from 'postgres';
import { ActivityVariant } from '../../schemas/activitySchema';
import { EventName } from '../../storeDbEvent';
import conn from '../dbConnection';
import { storeRow } from '../dbUtils';
import { eventTableName, storeActivity, storeEvent } from './event';

async function storeEventAPILookup(
  sql: postgres.TransactionSql,
  event_id: number,
  activity_id: number,
  module: string,
  name: string,
) {
  return storeRow(sql, eventTableName(EventName.APILookup), {
    id: event_id,
    activity_id,
    module,
    name,
  });
}

export default async function saveAPILookupEvent(
  user_uuid: string,
  experiment_key: string,
  module: string,
  name: string,
  activity_variant: ActivityVariant,
): Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pActivityId = storeActivity(sql, activity_variant);
      const pEventId = storeEvent(
        sql,
        user_uuid,
        experiment_key,
        EventName.APILookup,
      );
      await storeEventAPILookup(
        sql,
        await pEventId,
        await pActivityId,
        module,
        name,
      );
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error while saving an API lookup event', e);
    return false;
  }
}
