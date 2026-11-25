import logAnalyticsEvent, { AnalyticsEventName } from './analyticsEvent';
import type { PythonMode } from './execution/codeExecution';
import { CLIENT_SIDE_EXECUTION_TAG } from './execution/versions';
import type {
  LiveAnalysisStatus,
  MetadataForEvent,
  ToolboxFunction,
} from './localStorage/schema';
import {
  ActivityVariant,
  PythonFile,
  activityVariantId,
} from './schemas/activitySchema';
import { EventName, storeDbEvent } from './storeDbEvent';

export type CodeExecutionEvent = {
  metadata: MetadataForEvent;
  sources: string[];
  initialSources: string[];
  requestedCellSequenceNumber: number;
  toolboxFunctions: ToolboxFunction[];
  activityVariant: ActivityVariant;
  extraPythonFiles: PythonFile[];
  liveAnalysis: LiveAnalysisStatus;
  executionUUID: string;
  pythonMode: PythonMode;
};

export default function registerCodeExecutionEvent({
  metadata,
  sources,
  initialSources,
  requestedCellSequenceNumber,
  toolboxFunctions,
  activityVariant,
  extraPythonFiles,
  liveAnalysis,
  executionUUID,
  pythonMode,
}: CodeExecutionEvent): void {
  logAnalyticsEvent(AnalyticsEventName.CodeExecution, {
    activity: activityVariantId(activityVariant),
  });
  storeDbEvent(EventName.CodeExecution, metadata, {
    sources,
    initialSources,
    requestedCellSequenceNumber,
    toolboxFunctions,
    activityVariant,
    extraPythonFiles,
    liveAnalysis,
    executionUUID,
    pythonMode,
    clientSideExecutionTag: CLIENT_SIDE_EXECUTION_TAG,
  });
}
