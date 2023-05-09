import { v4 as uuidv4 } from 'uuid';

export const CURRENT_VERSION = '2';

export interface Metadata {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown'
  activities: ActivityVariantMetadata[],
}

export interface ActivityVariantMetadata {
  id: string,
  codeCellsKey: string,
  cellsModified: boolean,
  completed: boolean,
}

export interface CodeCellState {
  source: string;
  executionInProgress: boolean;
  executionResponse: any;
  outputAreaVisible: boolean;
  outputSynced: boolean;
  originalIndex: number;
}

export type CodeState = CodeCellState[];

/* Keys for local storage */

export const METADATA_KEY = 'pytamaro-web';

export function getActivityVariantCodeCellsKey(activityVariantId: string) {
  return `${METADATA_KEY}-${activityVariantId}-codeCells`;
}

/* Default values */

export function getDefaultActivityVariantMetadata(activityVariantId: string)
  : ActivityVariantMetadata {
  return {
    id: activityVariantId,
    codeCellsKey: getActivityVariantCodeCellsKey(activityVariantId),
    cellsModified: false,
    completed: false,
  };
}

export function getDefaultMetadata() : Metadata {
  return {
    dataModelVersion: CURRENT_VERSION,
    userUuid: uuidv4(),
    activities: [],
    allowSharingAnonData: 'unknown',
    experimentKey: '',
  };
}
