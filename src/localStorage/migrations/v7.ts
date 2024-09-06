import {
  ActivityVariantMetadata,
  CurriculumMetadata, DocsMetadata, Metadata, ToolboxFunction,
} from '../schema';

export interface MetadataV6 {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown'
  activities: ActivityVariantMetadata[],
  toolbox: ToolboxFunction[],
  curricula: CurriculumMetadata[],
  platformLocale: string | null,
  docs: DocsMetadata,
}

export default function migrateToV7(metadata: MetadataV6) : Metadata {
  const newMetadata = {
    ...metadata,
    dataModelVersion: '7',
    lastNotificationSeen: 8,
  };
  return newMetadata;
}
