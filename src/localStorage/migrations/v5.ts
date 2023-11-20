import {
  ActivityVariantMetadata,
  CurriculumMetadata, Metadata, ToolboxFunction,
} from '../schema';

export interface MetadataV4 {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown'
  activities: ActivityVariantMetadata[],
  toolbox: ToolboxFunction[],
  curricula: CurriculumMetadata[]
}

export default function migrateToV5(metadata: MetadataV4) : Metadata {
  const newMetadata = {
    ...metadata,
    dataModelVersion: '5',
    platformLocale: null,
  };
  return newMetadata;
}
