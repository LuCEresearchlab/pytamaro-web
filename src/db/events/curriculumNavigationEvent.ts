import postgres from 'postgres';
import { ActivityVariant } from '../../schemas/activitySchema';
import { Curriculum } from '../../schemas/curriculumSchema';
import { EventName } from '../../storeDbEvent';
import conn from '../dbConnection';
import { storeRow } from '../dbUtils';
import {
  eventTableName,
  storeActivity,
  storeCurriculum,
  storeEvent,
} from './event';

async function storeEventCurriculumNavigation(
  sql: postgres.TransactionSql,
  event_id: number,
  activity_id: number,
  curriculum_id: number,
  navigation_type: string,
) {
  return storeRow(sql, eventTableName(EventName.CurriculumNavigation), {
    id: event_id,
    navigation_type,
    curriculum_id,
    activity_id,
  });
}

export default async function saveCurriculumNavigationEvent(
  user_uuid: string,
  experiment_key: string,
  activity_variant: ActivityVariant,
  curriculum: Curriculum,
  navigation_type: string,
): Promise<boolean> {
  try {
    await conn.begin(async (sql) => {
      const pActivityId = storeActivity(sql, activity_variant);
      const pCurriculumId = storeCurriculum(sql, curriculum);
      const pEventId = storeEvent(
        sql,
        user_uuid,
        experiment_key,
        EventName.CurriculumNavigation,
      );
      await storeEventCurriculumNavigation(
        sql,
        await pEventId,
        await pActivityId,
        await pCurriculumId,
        navigation_type,
      );
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error while saving a Curriculum Navigation event', e);
    return false;
  }
}
