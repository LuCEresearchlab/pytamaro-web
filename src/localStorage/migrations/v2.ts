import { ActivityVariantMetadata, Metadata, getDefaultMetadata } from '../schema';

export interface MetadataV1 {
  dataModelVersion: string;
  activities: ActivityVariantMetadata[],
}

export default function migrateToV2(metadata: MetadataV1) : Metadata {
  const base = getDefaultMetadata();
  return {
    ...metadata,
    dataModelVersion: base.dataModelVersion,
    userUuid: base.userUuid,
    experimentKey: base.experimentKey,
    allowSharingAnonData: base.allowSharingAnonData,
  };
}
