import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import {
  Badge,
  BadgeProps,
  Card, CardActions, CardContent, Collapse, Paper,
  Stack,
  Tooltip,
  debounce,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { ExecutionResponse, isExecutionCompleted } from '../src/codeExecution';
import { CodeCellExecutionState } from '../src/localStorage/schema';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { called_names, find_ellipsis, imported_names } from '../src/python-analyzer/python_analyzer';
import { ActivityVariant, PlatformConfiguration } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { EllipsisTip, InputTip, NoOutputTip } from './CodeCellTips';
import CodeEditor from './CodeEditor';
import DocumentationStripe from './DocumentationStripe';
import OutputArea from './OutputArea';
import RunButton from './RunButton';

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
  initialSource, currentSource, codeCellExecutionState, onSourceChanged, onExecutionRequested,
  firstLineNumber, activityVariant, sourcesUpTo, platformConfig, resetCounter,
  extraActions = null, readOnly = false,
} :
{ initialSource: string,
  currentSource: string,
  codeCellExecutionState: CodeCellExecutionState,
  onSourceChanged: (newSource: string) => void,
  onExecutionRequested: () => Promise<any>,
  firstLineNumber : number,
  activityVariant: ActivityVariant,
  sourcesUpTo: string[],
  platformConfig: PlatformConfiguration,
  resetCounter: number,
  extraActions?: React.ReactNode
  readOnly?: boolean
}) {
  const { t } = useLocalTranslation(['common']);
  const { executionResponse } = codeCellExecutionState;
  const executionError = isExecutionError(executionResponse);
  const executing = codeCellExecutionState.executionInProgress;
  const executionFinished = codeCellExecutionState.outputSynced;
  const noOutput = executionFinished
    && executionResponse && isExecutionCompleted(executionResponse)
    && (executionResponse.stdout + executionResponse.stderr).length === 0;
  const [inputFunctionCalled, setInputFunctionCalled] = useState(false);
  const [ellipsis, setEllipsis] = useState(false);
  const outputHidden = noOutput || inputFunctionCalled;

  const debouncedFindCalledNames = useMemo(() => {
    const findCalledNames = async (currentCellSource: string) => {
      try {
        const names : string[] = await called_names(currentCellSource);
        setInputFunctionCalled(names.includes('input'));
      } catch (e) {
        setInputFunctionCalled(false);
      }
    };

    return debounce(findCalledNames, 100);
  }, []);

  const debouncedFindEllipsis = useMemo(() => {
    const findEllipsis = async (currentCellSource: string) => {
      try {
        setEllipsis(await find_ellipsis(currentCellSource));
      } catch (e) {
        setEllipsis(false);
      }
    };
    return debounce(findEllipsis, 100);
  }, []);

  useEffect(() => {
    debouncedFindCalledNames(currentSource);
    debouncedFindEllipsis(currentSource);
  }, [currentSource, debouncedFindCalledNames, debouncedFindEllipsis]);

  return (
    <Paper elevation={readOnly ? 0 : 4}>
      {!readOnly
        && (
        <DocumentationStripe
          sources={sourcesUpTo}
          activityVariant={activityVariant}
        />
        )}
      <Card>
        <CardContent>
          <CodeEditor
            initialSource={initialSource}
            currentSource={currentSource}
            onChange={onSourceChanged}
            onExecutionRequested={onExecutionRequested}
            executionAllowed={!executing && !executionFinished}
            executionFinished={executionFinished}
            firstLineNumber={firstLineNumber}
            readOnly={readOnly}
            executionResponse={executionResponse}
            collapsedErrorMarkers={outputHidden}
            resetCounter={resetCounter}
          />
        </CardContent>
        <CardActions disableSpacing sx={{ paddingLeft: 2, display: 'flex' }}>
          <RunButton
            onExecutionRequested={onExecutionRequested}
            executing={executing}
            executionFinished={executionFinished}
            executionError={executionError}
          />
          <Stack direction="row" sx={{ marginLeft: 'auto' }}>
            {extraActions}
          </Stack>
        </CardActions>
        {noOutput && platformConfig.showNoOutputTip && (
          <NoOutputTip importedNames={imported_names(joinLines(sourcesUpTo))} />
        )}
        {inputFunctionCalled && <InputTip />}
        {ellipsis && <EllipsisTip />}
        {!outputHidden && (
        <Collapse in={codeCellExecutionState.outputAreaVisible} timeout="auto" unmountOnExit>
          <CardContent>
            <StaleOutputBadge
              badgeContent={<Tooltip arrow title={t('staleOutput')}><SyncProblemIcon /></Tooltip>}
              color="error"
              invisible={codeCellExecutionState.outputSynced}
            >
              {executionResponse && isExecutionCompleted(executionResponse) && (
              <OutputArea
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
