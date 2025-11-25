import { PlayCircleFilled } from '@mui/icons-material';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import {
  Badge,
  BadgeProps,
  Card,
  CardActions,
  CardContent,
  Collapse,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useState } from 'react';
import { ExecutionResponse, isExecutionCompleted } from '../src/codeExecution';
import { CodeCellExecutionState } from '../src/localStorage/schema';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  AnalysisResult,
  analyze,
} from '../src/python-analyzer/python_analyzer';
import {
  ActivityVariant,
  PlatformConfiguration,
  PythonFile,
} from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { PythonAnalyzer } from '../src/usePythonAnalyzer';
import { EllipsisTip, InputTip, NoOutputTip } from './CodeCellTips';
import CodeEditor from './CodeEditor';
import ExecutionOutputArea from './OutputArea';
import RunButton from './RunButton';
import DocumentationStripe from './documentation/DocumentationStripe';

const StaleOutputBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  width: '100%',
}));

export function isExecutionError(response: ExecutionResponse | undefined) {
  return response?.type === 'error';
}

export default function CodeCell({
  initialSource,
  currentSource,
  codeCellExecutionState,
  onSourceChanged,
  onExecutionRequested,
  firstLineNumber,
  activityVariant,
  sourcesUpTo,
  platformConfig,
  resetCounter,
  pythonAnalyzer,
  cellIdx,
  extraPythonFiles = [],
  extraActions = null,
  readOnly = false,
}: {
  initialSource: string;
  currentSource: string;
  codeCellExecutionState: CodeCellExecutionState;
  onSourceChanged: (newSource: string) => void;
  onExecutionRequested: () => Promise<void>;
  firstLineNumber: number;
  activityVariant: ActivityVariant;
  sourcesUpTo: string[];
  platformConfig: PlatformConfiguration;
  resetCounter: number;
  pythonAnalyzer: PythonAnalyzer | null;
  cellIdx: number;
  extraPythonFiles?: PythonFile[];
  extraActions?: React.ReactNode;
  readOnly?: boolean;
}) {
  const { t } = useLocalTranslation(['common']);
  const { executionResponse } = codeCellExecutionState;
  const executionError = isExecutionError(executionResponse);
  const executing = codeCellExecutionState.executionInProgress;
  const executionFinished = codeCellExecutionState.outputSynced;
  const noOutput =
    executionFinished &&
    executionResponse &&
    isExecutionCompleted(executionResponse) &&
    (executionResponse.stdout + executionResponse.stderr).length === 0;
  const [inputFunctionCalled, setInputFunctionCalled] = useState(false);
  const [ellipsis, setEllipsis] = useState(false);
  const outputHidden = noOutput || inputFunctionCalled;

  useEffect(() => {
    const analyzeSource = async () => {
      const analysisResult: AnalysisResult = await analyze(currentSource);
      setInputFunctionCalled(analysisResult.called_names.includes('input'));
      setEllipsis(analysisResult.has_ellipsis);
    };
    analyzeSource();
  }, [currentSource]);

  const confirm = useConfirm();

  const handleExecutionRequest = async () => {
    // Check for static errors before executing
    const diagnosticsUpToCurrentCell =
      pythonAnalyzer!.getDiagnosticsCountUpTo(cellIdx);
    const diagnosticsUpToPreviousCells =
      pythonAnalyzer!.getDiagnosticsCountUpTo(cellIdx - 1);
    const currentCellDiagnostics =
      diagnosticsUpToCurrentCell - diagnosticsUpToPreviousCells;
    if (diagnosticsUpToCurrentCell === 0) {
      return onExecutionRequested();
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
    }).then(() => {
      return onExecutionRequested();
    });
  };

  return (
    <Paper
      elevation={readOnly ? 0 : 4}
      className='pytamaro-web-code-cell anchor'
    >
      {!readOnly && (
        <DocumentationStripe
          sources={sourcesUpTo}
          activityVariant={activityVariant}
          extraPythonFiles={extraPythonFiles}
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
            executionAllowed={!executing}
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
            executing={executing}
            executionFinished={executionFinished}
            executionError={executionError}
          />
          <Stack direction='row' sx={{ marginLeft: 'auto' }}>
            {extraActions}
          </Stack>
        </CardActions>
        {noOutput && platformConfig.showNoOutputTip && (
          <NoOutputTip
            importedNames={analyze(joinLines(sourcesUpTo)).imported_names}
          />
        )}
        {inputFunctionCalled && <InputTip />}
        {ellipsis && <EllipsisTip />}
        {!outputHidden && (
          <Collapse
            in={codeCellExecutionState.outputAreaVisible}
            timeout='auto'
            unmountOnExit
          >
            <CardContent>
              <StaleOutputBadge
                badgeContent={
                  <Tooltip arrow title={t('staleOutput')}>
                    <SyncProblemIcon />
                  </Tooltip>
                }
                color='error'
                invisible={codeCellExecutionState.outputSynced}
              >
                {executionResponse &&
                  isExecutionCompleted(executionResponse) && (
                    <ExecutionOutputArea
                      executionError={executionError}
                      executionResponse={executionResponse}
                      dimmed={!codeCellExecutionState.outputSynced}
                    />
                  )}
              </StaleOutputBadge>
            </CardContent>
          </Collapse>
        )}
      </Card>
    </Paper>
  );
}
