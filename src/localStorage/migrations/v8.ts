import {
  ActivityVariantMetadata,
  CurriculumMetadata,
  DocsMetadata,
  LiveAnalysisStatus,
  Metadata,
  ToolboxFunction,
} from '../schema';

export interface MetadataV7 {
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
}

export default function migrateToV8(metadata: MetadataV7): Metadata {
  const newMetadata: Metadata = {
    ...metadata,
    dataModelVersion: '8',
    liveAnalysis: LiveAnalysisStatus.Syntax,
    wideEditor: false,
  };
  return newMetadata;
}
