import { v4 as uuidv4 } from 'uuid';
import { ActivityVariant } from '../schemas/activitySchema';

export const CURRENT_VERSION = '3';

export interface Metadata {
  dataModelVersion: string;
  userUuid: string;
  experimentKey: string;
  allowSharingAnonData: 'yes' | 'no' | 'unknown'
  activities: ActivityVariantMetadata[],
  toolbox: ToolboxFunction[],
  curricula: CurriculumMetadata[]
}

export interface ToolboxFunction {
  name: string,
  description: string,
  source: string,
  usage: string,
  args: PythonFunctionArgument[],
  returnTypeUnparsed: string,
  originalActivity: ActivityVariant
}

export interface PythonFunctionArgument {
  name: string,
  typeUnparsed: string,
}

export interface ActivityVariantMetadata {
  id: string,
  codeCellsKey: string,
  cellsModified: boolean,
  completed: boolean,
  doNowCompleted: string[]
}

export interface CurriculumMetadata {
  id: string,
}

export interface CodeCellState {
  source: string;
  originalIndex: number;
}

export interface CodeCellExecutionState {
  executionInProgress: boolean;
  executionResponse: any;
  outputAreaVisible: boolean;
  outputSynced: boolean;
}

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
    doNowCompleted: [],
  };
}

export function getDefaultMetadata() : Metadata {
  return {
    dataModelVersion: CURRENT_VERSION,
    userUuid: uuidv4(),
    activities: [],
    allowSharingAnonData: 'unknown',
    experimentKey: '',
    toolbox: [],
    curricula: [],
  };
}
