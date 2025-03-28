import postgres from 'postgres';
import { ActivityVariant } from '../../schemas/activitySchema';
import { EventName } from '../../storeDbEvent';
import conn from '../dbConnection';
import { storeRow } from '../dbUtils';
import { eventTableName, storeActivity, storeEvent } from './event';

async function storeEventDoNowCompleted(
  sql: postgres.TransactionSql,
  event_id: number,
  activity_id: number,
  do_now_id: string,
  answer: string,
) {
  return storeRow(sql, eventTableName(EventName.DoNowCompleted), {
    id: event_id,
    activity_id,
    do_now_id,
    answer,
  });
}

export default async function saveDoNowCompletedEvent(
  user_uuid: string,
  experiment_key: string,
  activity_variant: ActivityVariant,
  do_now_id: string,
  answer: string,
): Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pActivityId = storeActivity(sql, activity_variant);
      const pEventId = storeEvent(
        sql,
        user_uuid,
        experiment_key,
        EventName.DoNowCompleted,
      );
      await storeEventDoNowCompleted(
        sql,
        await pEventId,
        await pActivityId,
        do_now_id,
        answer,
      );
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error while saving a Do Now Completed event', e);
    return false;
  }
}
