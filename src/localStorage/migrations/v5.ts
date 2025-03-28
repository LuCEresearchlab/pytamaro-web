import {
  ActivityVariantMetadata,
  CurriculumMetadata,
  ToolboxFunction,
} from '../schema';
import { MetadataV5 } from './v6';

export interface MetadataV4 {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown';
  activities: ActivityVariantMetadata[];
  toolbox: ToolboxFunction[];
  curricula: CurriculumMetadata[];
}

export default function migrateToV5(metadata: MetadataV4): MetadataV5 {
  const newMetadata = {
    ...metadata,
    dataModelVersion: '5',
    platformLocale: null,
  };
  return newMetadata;
}
