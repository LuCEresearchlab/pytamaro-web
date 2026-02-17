import { PlayCircleFilled } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  Collapse,
  Paper,
  Stack,
} from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { useMemo } from 'react';
import {
  isExecutionCompleted,
  isExecutionError,
  isExecutionFailed,
} from '../src/codeExecution';
import { CodeCellExecutionState } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  ActivityVariant,
  PlatformConfiguration,
  PythonFile,
} from '../src/schemas/activitySchema';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import useAnalysisResult from '../src/useAnalysisResult';
import { PythonAnalyzer } from '../src/usePythonAnalyzer';
import { EllipsisTip, NoOutputTip } from './CodeCellTips';
import CodeEditor from './CodeEditor';
import DocumentationStripe from './documentation/DocumentationStripe';
import ExecutionOutputArea from './input_output/ExecutionOutputArea';
import { OutputAreaRef } from './input_output/OutputArea';
import RunButton from './RunButton';
import StaleOutputBadge from './StaleOutputBadge';

export default function CodeCell({
  initialSource,
  currentSource,
  codeCellExecutionState,
  onSourceChanged,
  onExecutionRequestEvent,
  onExecutionRequested,
  firstLineNumber,
  activityVariant,
  platformConfig,
  resetCounter,
  pythonAnalyzer,
  cellIdx,
  setOutputAreaRef,
  extraPythonFiles = [],
  extraActions = null,
  readOnly = false,
  runEnabled = true,
}: {
  initialSource: string;
  currentSource: string;
  codeCellExecutionState: CodeCellExecutionState;
  onSourceChanged: (newSource: string) => void;
  onExecutionRequestEvent: (executionUUID: string) => void;
  onExecutionRequested: (executionUUID: string) => Promise<void>;
  firstLineNumber: number;
  activityVariant: ActivityVariant;
  platformConfig: PlatformConfiguration;
  resetCounter: number;
  pythonAnalyzer: PythonAnalyzer | null;
  cellIdx: number;
  setOutputAreaRef: (
    idx: number,
    node: OutputAreaRef | null | undefined,
  ) => void;
  extraPythonFiles?: PythonFile[];
  extraActions?: React.ReactNode;
  readOnly?: boolean;
  runEnabled?: boolean;
}) {
  const { t } = useLocalTranslation(['common']);
  const { metadata } = useLocalProfile();
  const { executionResponse } = codeCellExecutionState;
  const executionError =
    isExecutionError(executionResponse) || isExecutionFailed(executionResponse);
  const executing = codeCellExecutionState.executionUUID !== undefined;
  const executionFinished =
    codeCellExecutionState.outputSynced &&
    isExecutionCompleted(executionResponse);
  const noOutput =
    isExecutionCompleted(executionResponse) &&
    (executionResponse.stdout + executionResponse.stderr).length === 0;

  const analysisResult = useAnalysisResult(pythonAnalyzer, cellIdx);

  const extraPythonFilesAnalysisResults = useMemo(() => {
    if (!pythonAnalyzer) {
      return [];
    }
    return extraPythonFiles.map((file) => ({
      name: file.name,
      analysisResult: pythonAnalyzer.analyzeExtraPythonFile(file),
    }));
  }, [pythonAnalyzer, extraPythonFiles]);

  const ellipsis = (analysisResult?.ellipsis.length ?? 0) > 0;

  const confirm = useConfirm();

  const handleExecutionRequest = async () => {
    const executionRequestUUID = crypto.randomUUID();
    // Immediately notify that an execution has been requested,
    // so that we can log the even if later on the user decides to cancel the execution after seeing the warning dialog.
    onExecutionRequestEvent(executionRequestUUID);

    // Check for static errors before executing
    const diagnosticsUpToCurrentCell =
      pythonAnalyzer!.getDiagnosticsCountUpTo(cellIdx);
    const diagnosticsUpToPreviousCells =
      pythonAnalyzer!.getDiagnosticsCountUpTo(cellIdx - 1);
    const currentCellDiagnostics =
      diagnosticsUpToCurrentCell - diagnosticsUpToPreviousCells;
    if (diagnosticsUpToCurrentCell === 0) {
      return onExecutionRequested(executionRequestUUID);
    }

    let message;
    if (currentCellDiagnostics > 0 && diagnosticsUpToPreviousCells === 0) {
      message = t('confirmExecutionWithErrors.descriptionOnlyCurrentCell', {
        count: currentCellDiagnostics,
      });
    } else if (currentCellDiagnostics === 0) {
      message = t('confirmExecutionWithErrors.descriptionOnlyPreviousCells', {
        count: diagnosticsUpToPreviousCells,
      });
    } else {
      message = t('confirmExecutionWithErrors.descriptionWithPreviousCells', {
        currentCount: currentCellDiagnostics,
        previousCount: diagnosticsUpToPreviousCells,
      });
    }

    return confirm({
      title: t('confirmExecutionWithErrors.title'),
      description: message,
      confirmationText: t('confirmExecutionWithErrors.confirmationText'),
      cancellationText: t('confirmExecutionWithErrors.cancellationText'),
      confirmationButtonProps: {
        endIcon: <PlayCircleFilled />,
        variant: 'contained',
      },
    }).then(({ confirmed }) => {
      const forced_execution = confirmed;
      storeDbEvent(EventName.CodeExecutionErrorsWarning, metadata, {
        executionUUID: executionRequestUUID,
        forced_execution,
      });
      if (forced_execution) {
        return onExecutionRequested(executionRequestUUID);
      }
    });
  };

  return (
    <Paper
      elevation={readOnly ? 0 : 4}
      className='pytamaro-web-code-cell anchor'
    >
      {!readOnly && (
        <DocumentationStripe
          analysisResult={analysisResult}
          activityVariant={activityVariant}
          extraPythonFilesAnalysisResults={extraPythonFilesAnalysisResults}
        />
      )}
      {/* Overflow to allow for overflowed widgets in a CodeEditor */}
      <Card sx={{ overflow: 'visible' }}>
        <CardContent>
          <CodeEditor
            initialSource={initialSource}
            currentSource={currentSource}
            onChange={onSourceChanged}
            onExecutionRequested={handleExecutionRequest}
            executionAllowed={runEnabled}
            executionFinished={executionFinished}
            firstLineNumber={firstLineNumber}
            readOnly={readOnly}
            executionResponse={executionResponse}
            resetCounter={resetCounter}
            pythonAnalyzer={pythonAnalyzer}
            cellIdx={cellIdx}
          />
        </CardContent>
        <CardActions disableSpacing sx={{ paddingLeft: 2, display: 'flex' }}>
          <RunButton
            onExecutionRequested={handleExecutionRequest}
            enabled={runEnabled}
            executing={executing}
            executionFinished={executionFinished}
            executionError={executionError}
          />
          <Stack direction='row' sx={{ marginLeft: 'auto' }}>
            {extraActions}
          </Stack>
        </CardActions>
        {noOutput && platformConfig.showNoOutputTip && (
          <StaleOutputBadge hidden={codeCellExecutionState.outputSynced}>
            <NoOutputTip
              dimmed={!codeCellExecutionState.outputSynced}
              importedNames={analysisResult?.imported_names}
            />
          </StaleOutputBadge>
        )}
        {ellipsis && <EllipsisTip />}
        <Collapse
          in={
            codeCellExecutionState.outputAreaVisible ||
            executing ||
            isExecutionFailed(executionResponse)
          }
          timeout='auto'
          unmountOnExit
        >
          <StaleOutputBadge hidden={codeCellExecutionState.outputSynced}>
            {executionResponse !== undefined && (
              <ExecutionOutputArea
                executionResponse={executionResponse}
                dimmed={!codeCellExecutionState.outputSynced}
                setOutputAreaRef={(node) => setOutputAreaRef(cellIdx, node)}
              />
            )}
          </StaleOutputBadge>
        </Collapse>
      </Card>
    </Paper>
  );
}
