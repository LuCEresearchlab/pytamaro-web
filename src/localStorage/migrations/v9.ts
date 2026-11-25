/**
 * This version used to introduce executionMode (necessary for a temporary period to distinguish between client-side and server-side execution).
 * It is now a no-op migration, except for bumping the dataModelVersion to 9, since the executionMode field has been removed from the schema
 * (it may persist in the users' localStorage, but should no longer be referenced in the codebase).
 */

import {
  ActivityVariantMetadata,
  CurriculumMetadata,
  DocsMetadata,
  LiveAnalysisStatus,
  ToolboxFunction,
} from '../schema';
import { MetadataV9 } from './v10';

export interface MetadataV8 {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown';
  activities: ActivityVariantMetadata[];
  toolbox: ToolboxFunction[];
  curricula: CurriculumMetadata[];
  platformLocale: string | null; // null means not explicitly chosen
  docs: DocsMetadata;
  lastNotificationSeen: number;
  liveAnalysis: LiveAnalysisStatus;
  wideEditor: boolean;
}

export default function migrateToV9(metadata: MetadataV8): MetadataV9 {
  const newMetadata: MetadataV9 = {
    ...metadata,
    dataModelVersion: '9',
  };
  return newMetadata;
}
