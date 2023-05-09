import postgres from 'postgres';
import { storeOrRetrieveRow, storeRow } from '../dbUtils';
import { ActivityVariant } from '../../schemas/activitySchema';
import { EventName } from '../../storeDbEvent';

export async function storeEvent(
  sql: postgres.TransactionSql,
  user_uuid: string,
  experiment_key: string,
  event_type: string,
) {
  return storeRow(sql, 'events', {
    user_uuid,
    experiment_key,
    event_type,
  });
}

export async function storeActivity(
  sql: postgres.TransactionSql,
  activity_variant: ActivityVariant,
) {
  return storeOrRetrieveRow(
    sql,
    'activities',
    {
      author_slug: activity_variant.authorSlug,
      activity_slug: activity_variant.activitySlug,
      language: activity_variant.language,
      version: activity_variant.version,
    },
  );
}

export function eventTableName(event: EventName) {
  return `events_${event}`;
}
