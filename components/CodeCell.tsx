import {
  TipsAndUpdates,
} from '@mui/icons-material';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import {
  Alert,
  AlertTitle,
  Badge,
  BadgeProps,
  Card, CardActions, CardContent, Collapse, Paper,
  Stack,
  Tooltip,
  debounce,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Trans } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { ExecutionResponse } from '../src/codeExecution';
import { CodeCellExecutionState, CodeCellState } from '../src/localStorage/schema';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { PythonName, called_names, imported_names } from '../src/python-analyzer/python_analyzer';
import { ActivityVariant } from '../src/schemas/activitySchema';
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

function NoOutputTip({ importedNames } : { importedNames: PythonName[] }) {
  const { t } = useLocalTranslation();
  const showGraphicNames: Record<string, string> = {
    pytamaro: 'show_graphic',
    'pytamaro.it': 'visualizza_grafica',
    'pytamaro.de': 'zeige_grafik',
    'pytamaro.fr': 'montre_graphique',
  };
  // Pick the language based on the first import from one of the pytamaro modules.
  // Default to English ("pytamaro") if we do not find a suitable module.
  const moduleName = importedNames.find(({ module }) => module in showGraphicNames)?.module || 'pytamaro';
  const apiName = showGraphicNames[moduleName];
  return (
    <Alert
      iconMapping={{
        success: <TipsAndUpdates fontSize="inherit" />,
      }}
    >
      <Trans t={t} i18nKey="noOutputTip" values={{ apiName }} components={{ code: <code /> }} />
    </Alert>
  );
}

function InputTip() {
  return (
    <Alert
      severity="warning"
    >
      <AlertTitle>
        Using the
        {' '}
        <code>input</code>
        {' '}
        function is currently not supported on this platform.
      </AlertTitle>
      {/* eslint-disable-next-line max-len */}
      This might be improved in the future. However, consider this general remark: mixing user interface aspects (input and output) with computations is not a good idea.
    </Alert>
  );
}

export function isExecutionError(response: ExecutionResponse | undefined) {
  return response?.type === 'error';
}

export default function CodeCell({
  codeCellState, codeCellExecutionState, onSourceChanged, onExecutionRequested,
  firstLineNumber, activityVariant, cumulativeSource,
  extraActions = null, readOnly = false,
} :
{ codeCellState : CodeCellState,
  codeCellExecutionState: CodeCellExecutionState,
  onSourceChanged: (newSource: string) => void,
  onExecutionRequested: () => Promise<any>,
  firstLineNumber : number,
  activityVariant: ActivityVariant,
  cumulativeSource: string,
  extraActions?: React.ReactNode
  readOnly?: boolean
}) {
  const { t } = useLocalTranslation(['common']);
  const { executionResponse } = codeCellExecutionState;
  const executionError = isExecutionError(executionResponse);
  const executing = codeCellExecutionState.executionInProgress;
  const executionFinished = codeCellExecutionState.outputSynced;
  const noOutput = executionFinished && executionResponse?.content.length === 0;
  const [inputFunctionCalled, setInputFunctionCalled] = useState(false);

  const debouncedFindCalledNames = useMemo(() => {
    const findCalledNames = async (currentCellSource: string) => {
      try {
        const names : string[] = await called_names(currentCellSource);
        setInputFunctionCalled(names.includes('input'));
      } catch (e) {
        setInputFunctionCalled(false);
      }
    };

    return debounce(findCalledNames, 200);
  }, []);

  useEffect(() => {
    debouncedFindCalledNames(codeCellState.source);
  }, [codeCellState.source, debouncedFindCalledNames]);

  return (
    <Paper elevation={readOnly ? 0 : 4}>
      {!readOnly
        && <DocumentationStripe source={codeCellState.source} activityVariant={activityVariant} />}
      <Card>
        <CardContent>
          <CodeEditor
            source={codeCellState.source}
            onChange={onSourceChanged}
            onExecutionRequested={onExecutionRequested}
            executionAllowed={!executing && !executionFinished}
            firstLineNumber={firstLineNumber}
            readOnly={readOnly}
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
        {noOutput && (
          <NoOutputTip importedNames={imported_names(cumulativeSource)} />
        )}
        {inputFunctionCalled && <InputTip /> }
        <Collapse in={codeCellExecutionState.outputAreaVisible} timeout="auto" unmountOnExit>
          <CardContent>
            <StaleOutputBadge
              badgeContent={<Tooltip arrow title={t('staleOutput')}><SyncProblemIcon /></Tooltip>}
              color="error"
              invisible={codeCellExecutionState.outputSynced}
            >
              {executionResponse && (
                <OutputArea
                  executionError={executionError}
                  executionResponse={executionResponse}
                />
              )}
            </StaleOutputBadge>
          </CardContent>
        </Collapse>
      </Card>
    </Paper>
  );
}
