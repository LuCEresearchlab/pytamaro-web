import {
  TipsAndUpdates,
} from '@mui/icons-material';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import {
  Alert,
  Badge,
  BadgeProps,
  Card, CardActions, CardContent, Collapse, Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { ExecutionResponse } from '../src/codeExecution';
import { CodeCellExecutionState, CodeCellState } from '../src/localStorage/schema';
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

function NoOutputTip({ activityVariant } : { activityVariant: ActivityVariant }) {
  const showGraphicNames: Record<string, string> = {
    en: 'show_graphic',
    it: 'visualizza_grafica',
    de: 'zeige_grafik',
  };
  const apiName = activityVariant.language in showGraphicNames
    ? showGraphicNames[activityVariant.language]
    : showGraphicNames.en;
  return (
    <Alert
      iconMapping={{
        success: <TipsAndUpdates fontSize="inherit" />,
      }}
    >
      Successfully executed, but no output produced. Did you intend to show a graphic?
      Use
      {' '}
      <code>{apiName}</code>
      .
    </Alert>
  );
}

export function isExecutionError(response: ExecutionResponse | undefined) {
  return response?.type === 'error';
}

export default function CodeCell({
  codeCellState, codeCellExecutionState, onSourceChanged, onExecutionRequested,
  firstLineNumber, activityVariant,
  extraActions = null,
} :
{ codeCellState : CodeCellState,
  codeCellExecutionState: CodeCellExecutionState,
  onSourceChanged: (newSource: string) => void,
  onExecutionRequested: () => Promise<any>,
  firstLineNumber : number,
  activityVariant: ActivityVariant,
  extraActions?: React.ReactNode
}) {
  const theme = useTheme();

  const { executionResponse } = codeCellExecutionState;
  const executionError = isExecutionError(executionResponse);
  const executing = codeCellExecutionState.executionInProgress;
  const executionFinished = codeCellExecutionState.outputSynced;
  const noOutput = executionFinished && executionResponse?.content.length === 0;
  return (
    <Paper elevation={4}>
      <DocumentationStripe source={codeCellState.source} activityVariant={activityVariant} />
      <Card>
        <CardContent>
          <CodeEditor
            source={codeCellState.source}
            onChange={onSourceChanged}
            firstLineNumber={firstLineNumber}
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
          <NoOutputTip activityVariant={activityVariant} />
        )}
        <Collapse in={codeCellExecutionState.outputAreaVisible} timeout="auto" unmountOnExit>
          <CardContent>
            <StaleOutputBadge
              badgeContent={<Tooltip title="Stale output: re-run your code to refresh it"><SyncProblemIcon /></Tooltip>}
              color="error"
              invisible={codeCellExecutionState.outputSynced}
            >
              <Card
                sx={{
                  backgroundColor: executionError ? '#101010' : theme.palette.grey[100],
                  color: executionError ? 'white' : 'black',
                  p: 2,
                  overflowX: 'auto',
                  width: '100%',
                }}
              >
                <OutputArea executionResponse={executionResponse} />
              </Card>
            </StaleOutputBadge>
          </CardContent>
        </Collapse>
      </Card>
    </Paper>
  );
}
