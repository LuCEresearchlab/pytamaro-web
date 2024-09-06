import {
  ActivityVariantMetadata,
  CurriculumMetadata,
  ToolboxFunction,
  defaultDocsMetadata,
} from '../schema';
import { MetadataV6 } from './v7';

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

export default function migrateToV6(metadata: MetadataV5) : MetadataV6 {
  const newMetadata = {
    ...metadata,
    dataModelVersion: '6',
    docs: defaultDocsMetadata(),
  };
  return newMetadata;
}
