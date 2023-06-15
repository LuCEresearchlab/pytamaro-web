import { ActivityVariantMetadata, Metadata, getDefaultMetadata } from '../schema';

export interface MetadataV2 {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown'
  activities: ActivityVariantMetadata[],
}

export default function migrateToV3(metadata: MetadataV2) : Metadata {
  /* Add new metadata properties */
  const newMetadata = {
    ...getDefaultMetadata(),
    ...metadata,
    dataModelVersion: '3',
  };
  /* Add empty "doNowCompleted" array to each activity */
  newMetadata.activities = newMetadata.activities.map((activity) => ({
    ...activity,
    doNowCompleted: [],
  }));
  return newMetadata;
}
