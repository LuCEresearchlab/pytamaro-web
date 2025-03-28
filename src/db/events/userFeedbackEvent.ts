import postgres from 'postgres';
import conn from '../dbConnection';
import { eventTableName, storeEvent } from './event';
import { storeRow } from '../dbUtils';
import { EventName } from '../../storeDbEvent';

async function storeEventUserFeedback(
  sql: postgres.TransactionSql,
  event_id: number,
  name: string,
  email: string,
  message: string,
  pathname: string,
) {
  return storeRow(sql, eventTableName(EventName.UserFeedback), {
    id: event_id,
    name,
    email,
    message,
    pathname,
  });
}

export default async function saveUserFeedbackEvent(
  user_uuid: string,
  experiment_key: string,
  name: string,
  email: string,
  message: string,
  pathname: string,
): Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pEventId = storeEvent(
        sql,
        user_uuid,
        experiment_key,
        EventName.UserFeedback,
      );
      await storeEventUserFeedback(
        sql,
        await pEventId,
        name,
        email,
        message,
        pathname,
      );
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error while saving a user feedback event', e);
    return false;
  }
}
