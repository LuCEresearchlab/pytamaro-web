import { v4 as uuidv4 } from 'uuid';
import { changelogEntries } from '../../components/ChangelogList';
import { type ExecutionResponse } from '../codeExecution';
import { ActivityVariant } from '../schemas/activitySchema';

export const CURRENT_VERSION = '9';

export interface Metadata {
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
  executionMode: ExecutionMode;
}

export type MetadataForEvent = Pick<
  Metadata,
  'allowSharingAnonData' | 'userUuid' | 'experimentKey'
>;

export enum LiveAnalysisStatus {
  None = 'none',
  Syntax = 'syntax',
  SyntaxSemantics = 'syntax-semantics',
}

export enum ExecutionMode {
  ClientSide = 'cse',
  ServerSide = 'sse',
}

export interface DocsMetadata {
  showOptional: boolean;
  showDiagram: boolean;
  showTypes: boolean;
}

export interface ToolboxFunction {
  name: string;
  description: string;
  source: string;
  usage: string;
  args: PythonFunctionArgument[];
  returnTypeUnparsed: string;
  originalActivity: ActivityVariant;
  sideEffects?: boolean;
}

export interface PythonFunctionArgument {
  name: string;
  typeUnparsed: string;
}

export interface DoNowMetadata {
  id: string;
  answer: string;
}

export interface ActivityVariantMetadata {
  id: string;
  codeCellsKey: string;
  cellsModified: boolean;
  completed: boolean;
  doNowCompleted: DoNowMetadata[];
}

export interface CurriculumMetadata {
  id: string;
}

export interface CodeCellState {
  source: string;
  originalIndex: number;
}

export interface CodeCellExecutionState {
  executionUUID: string | undefined;
  executionResponse: ExecutionResponse | undefined;
  outputAreaVisible: boolean;
  outputSynced: boolean;
}

/* Keys for local storage */

export const METADATA_KEY = 'pytamaro-web';

export function getActivityVariantCodeCellsKey(activityVariantId: string) {
  return `${METADATA_KEY}-${activityVariantId}-codeCells`;
}

/* Default values */

export function getDefaultActivityVariantMetadata(
  activityVariantId: string,
): ActivityVariantMetadata {
  return {
    id: activityVariantId,
    codeCellsKey: getActivityVariantCodeCellsKey(activityVariantId),
    cellsModified: false,
    completed: false,
    doNowCompleted: [],
  };
}

export function defaultDocsMetadata(): DocsMetadata {
  return {
    showOptional: false,
    showDiagram: true,
    showTypes: false,
  };
}

export function getDefaultMetadata(): Metadata {
  return {
    dataModelVersion: CURRENT_VERSION,
    userUuid: uuidv4(),
    activities: [],
    allowSharingAnonData: 'unknown',
    experimentKey: '',
    toolbox: [],
    curricula: [],
    platformLocale: null,
    docs: defaultDocsMetadata(),
    lastNotificationSeen: changelogEntries.length - 1,
    liveAnalysis: LiveAnalysisStatus.Syntax,
    wideEditor: false,
    executionMode: ExecutionMode.ClientSide,
  };
}

/* Utils */

export function extractMetadataForEvent(metadata: Metadata): MetadataForEvent {
  const { allowSharingAnonData, userUuid, experimentKey } = metadata;
  return {
    allowSharingAnonData,
    userUuid,
    experimentKey,
  };
}
