import {
  ActivityVariantMetadata,
  CurriculumMetadata,
  DocsMetadata,
  ToolboxFunction,
} from '../schema';
import { MetadataV7 } from './v8';

export interface MetadataV6 {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown';
  activities: ActivityVariantMetadata[];
  toolbox: ToolboxFunction[];
  curricula: CurriculumMetadata[];
  platformLocale: string | null;
  docs: DocsMetadata;
}

export default function migrateToV7(metadata: MetadataV6): MetadataV7 {
  const newMetadata = {
    ...metadata,
    dataModelVersion: '7',
    lastNotificationSeen: 8,
  };
  return newMetadata;
}
