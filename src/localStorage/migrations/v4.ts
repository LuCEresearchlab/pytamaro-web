import { CurriculumMetadata, ToolboxFunction } from '../schema';
import { MetadataV4 } from './v5';

export interface ActivityVariantMetadataV3 {
  id: string;
  codeCellsKey: string;
  cellsModified: boolean;
  completed: boolean;
  doNowCompleted: string[];
}

export interface MetadataV3 {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown';
  activities: ActivityVariantMetadataV3[];
  toolbox: ToolboxFunction[];
  curricula: CurriculumMetadata[];
}

export default function migrateToV4(metadata: MetadataV3): MetadataV4 {
  const newMetadata = {
    ...metadata,
    dataModelVersion: '4',
    activities: metadata.activities.map((activity) => ({
      ...activity,
      doNowCompleted: activity.doNowCompleted.map((id) => ({
        id,
        answer: '',
      })),
    })),
  };
  return newMetadata;
}
