import { PlayCircleFilled } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Collapse,
  Paper,
  Stack,
} from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useMemo, useState } from 'react';
import {
  isExecutionError,
  isExecutionFailed,
  isExecutionNominal,
} from '../src/codeExecution';
import { CodeCellExecutionState } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { PythonName } from '../src/python-analyzer/python_analyzer';
import {
  ActivityVariant,
  PlatformConfiguration,
  PythonFile,
} from '../src/schemas/activitySchema';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import useAnalysisResult from '../src/useAnalysisResult';
import { useIsHydrated } from '../src/useIsHydrated';
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
  onResetExecutionState,
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
  onResetExecutionState: () => void;
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
    isExecutionNominal(executionResponse);
  const noOutput =
    isExecutionNominal(executionResponse) &&
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

  const isHydrated = useIsHydrated();

  const [
    alreadyClearedPossibleIncompleteExecution,
    setAlreadyClearedPossibleIncompleteExecution,
  ] = useState(false);

  useEffect(() => {
    if (!isHydrated || alreadyClearedPossibleIncompleteExecution) {
      return;
    }
    setAlreadyClearedPossibleIncompleteExecution(true);
    const { executionResponse } = codeCellExecutionState;
    if (isExecutionNominal(executionResponse) && !executionResponse.completed) {
      // The execution state refers to a previous execution that did not complete.
      // We want to reset the execution state.
      onResetExecutionState();
    }
  }, [
    codeCellExecutionState,
    onResetExecutionState,
    isHydrated,
    alreadyClearedPossibleIncompleteExecution,
  ]);

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

  const [hoveredName, setHoveredName] = useState<PythonName | null>(null);

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
          hoveredName={hoveredName}
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
            setHoveredName={setHoveredName}
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
        <Box sx={{ marginTop: 1 }}>
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
              // Show in case of a failed execution, because the alert is inside ExecutionOutputArea.
              isExecutionFailed(executionResponse)
            }
            timeout='auto'
            unmountOnExit
          >
            <StaleOutputBadge hidden={codeCellExecutionState.outputSynced}>
              {executionResponse !== undefined && (
                <ExecutionOutputArea
                  executionResponse={executionResponse}
                  firstLineNumber={firstLineNumber}
                  dimmed={!codeCellExecutionState.outputSynced}
                  setOutputAreaRef={(node) => setOutputAreaRef(cellIdx, node)}
                />
              )}
            </StaleOutputBadge>
          </Collapse>
        </Box>
      </Card>
    </Paper>
  );
}
