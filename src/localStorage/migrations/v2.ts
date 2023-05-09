import { playgroundActivityVariant } from '../../playground';
import { activityVariantId } from '../../schemas/activitySchema';
import { ActivityVariantMetadata, Metadata, getDefaultMetadata } from '../schema';

export interface MetadataV1 {
  dataModelVersion: string;
  activities: ActivityVariantMetadata[],
}

export default function migrateToV2(metadata: MetadataV1) : Metadata {
  /* Update playground activity variant id, if found */
  const activities = metadata.activities.map((activity) => (
    (activity.id === 'playground')
      ? { ...activity, id: activityVariantId(playgroundActivityVariant) }
      : activity
  ));
  /* Add new metadata properties */
  return {
    ...getDefaultMetadata(),
    activities,
  };
}
