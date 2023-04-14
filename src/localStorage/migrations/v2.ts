import { v4 as uuidv4 } from 'uuid';
import { ActivityVariantMetadata, Metadata } from '../schema';

export interface MetadataV1 {
  dataModelVersion: string;
  activities: ActivityVariantMetadata[],
}

export default function migrateToV2(metadata: MetadataV1) : Metadata {
  return {
    ...metadata, dataModelVersion: '2', userUuid: uuidv4(), allowSharingAnonData: 'unknown',
  };
}
