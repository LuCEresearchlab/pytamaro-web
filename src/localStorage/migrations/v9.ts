import {
  ActivityVariantMetadata,
  CurriculumMetadata,
  DocsMetadata,
  LiveAnalysisStatus,
  Metadata,
  ToolboxFunction,
} from '../schema';

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

export default function migrateToV9(metadata: MetadataV8): Metadata {
  const newMetadata: Metadata = {
    ...metadata,
    dataModelVersion: '9',
  };
  return newMetadata;
}
