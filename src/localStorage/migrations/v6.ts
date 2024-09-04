import {
  ActivityVariantMetadata,
  CurriculumMetadata, Metadata, ToolboxFunction,
  defaultDocsMetadata,
} from '../schema';

export interface MetadataV5 {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown'
  activities: ActivityVariantMetadata[],
  toolbox: ToolboxFunction[],
  curricula: CurriculumMetadata[],
  platformLocale: string | null
}

export default function migrateToV6(metadata: MetadataV5) : Metadata {
  const newMetadata = {
    ...metadata,
    dataModelVersion: '6',
    docs: defaultDocsMetadata(),
  };
  return newMetadata;
}
