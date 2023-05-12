import postgres from 'postgres';
import conn from '../dbConnection';
import { eventTableName, storeActivity, storeEvent } from './event';
import { storeRow } from '../dbUtils';
import { ActivityVariant } from '../../schemas/activitySchema';
import { EventName } from '../../storeDbEvent';

async function storeEventAPILookup(
  sql: postgres.TransactionSql,
  event_id: number,
  activity_id: number,
  name: string,
) {
  return storeRow(sql, eventTableName(EventName.APILookup), {
    id: event_id,
    activity_id,
    name,
  });
}

export default async function saveAPILookupEvent(
  user_uuid: string,
  experiment_key: string,
  name: string,
  activity_variant: ActivityVariant,
) : Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pActivityId = storeActivity(sql, activity_variant);
      const pEventId = storeEvent(sql, user_uuid, experiment_key, EventName.APILookup);
      await storeEventAPILookup(
        sql,
        await pEventId,
        await pActivityId,
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
