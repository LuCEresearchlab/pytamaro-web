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
  return {
    ...getDefaultMetadata(),
    ...metadata,
    dataModelVersion: '3',
  };
}
