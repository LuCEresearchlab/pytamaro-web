import { v4 as uuidv4 } from 'uuid';
import { playgroundActivityVariant } from '../../playground';
import { activityVariantId } from '../../schemas/activitySchema';
import { ActivityVariantMetadata } from '../schema';
import { MetadataV2 } from './v3';

export interface MetadataV1 {
  dataModelVersion: string;
  activities: ActivityVariantMetadata[];
}
export function getDefaultMetadataV2(): MetadataV2 {
  return {
    dataModelVersion: '2',
    userUuid: uuidv4(),
    activities: [],
    allowSharingAnonData: 'unknown',
    experimentKey: '',
  };
}

export default function migrateToV2(metadata: MetadataV1): MetadataV2 {
  /* Update playground activity variant id, if found */
  const activities = metadata.activities.map((activity) =>
    activity.id === 'playground'
      ? { ...activity, id: activityVariantId(playgroundActivityVariant) }
      : activity,
  );
  /* Add new metadata properties */
  return {
    ...getDefaultMetadataV2(),
    activities,
  };
}
