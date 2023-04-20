import dynamic from 'next/dynamic';
import { useTheme, styled } from '@mui/material/styles';
import {
  Badge,
  BadgeProps,
  Card, CardActions, CardContent, Collapse, IconButton, Paper,
  Tooltip,
} from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import DoneIcon from '@mui/icons-material/Done';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButtonProps } from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import OutputArea from './OutputArea';
import { CodeCellState } from '../src/codeState';

const AceEditor = dynamic(
  async () => {
    const ace = await import('react-ace');
    await import('ace-builds/src-noconflict/mode-python');
    await import('ace-builds/src-noconflict/theme-github');
    await import('ace-builds/src-noconflict/ext-language_tools');
    return ace;
  },
  {
    ssr: false,
  },
);

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const StaleOutputBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  width: '100%',
}));

export default function CodeCell({
  codeCellState, onSourceChanged, onExecutionRequested, onOutputAreaToggled, firstLineNumber,
} :
{ codeCellState : CodeCellState,
  onSourceChanged: (newSource: string) => void,
  onExecutionRequested: () => Promise<any>,
  onOutputAreaToggled: () => void,
  firstLineNumber : number,
}) {
  const theme = useTheme();
  const executionError = codeCellState.executionResponse?.type === 'error';
  const executionEnabled = !codeCellState.outputSynced;
  let buttonMessage = 'Run';
  let buttonTooltip = ''; // Empty tooltips are not displayed
  let buttonIcon = <PlayCircleFilledIcon />;
  if (codeCellState.executionResponse && executionEnabled) {
    buttonMessage = 'Re-Run';
  } else if (!executionEnabled) {
    buttonMessage = 'Done';
    buttonTooltip = 'Execution completed: re-run possible only after changing the code';
    buttonIcon = <DoneIcon />;
  } else if (codeCellState.executionInProgress) {
    buttonMessage = 'Running...';
  }
  return (
    <Paper elevation={4}>
      <Card>
        <CardContent>
          <AceEditor
            mode="python"
            theme="xcode"
            value={codeCellState.source}
            onLoad={(editor) => { editor.moveCursorTo(0, 0); }}
            onChange={onSourceChanged}
            maxLines={Infinity}
            fontSize="1rem"
            width="100%"
            showPrintMargin={false}
            highlightActiveLine={false}
            setOptions={{
              fontFamily: theme.pytamaro.monospaceFontFamily,
              firstLineNumber,
              showFoldWidgets: false,
            }}
          />
        </CardContent>
        <CardActions disableSpacing sx={{ padding: 2, display: 'flex' }}>
          <Tooltip title={buttonTooltip} placement="right">
            <span>
              <LoadingButton
                onClick={onExecutionRequested}
                endIcon={buttonIcon}
                loading={codeCellState.executionInProgress}
                loadingPosition="end"
                variant="contained"
                sx={{ minWidth: 200 }}
                disabled={!executionEnabled}
              >
                <span>{buttonMessage}</span>
              </LoadingButton>
            </span>
          </Tooltip>
          <ExpandMore
            expand={codeCellState.outputAreaVisible}
            aria-expanded={codeCellState.outputAreaVisible}
            aria-label="show output area"
            sx={{ visibility: codeCellState.executionResponse ? 'visible' : 'hidden' }}
            onClick={onOutputAreaToggled}
          >
            <ExpandMoreIcon fontSize="large" />
          </ExpandMore>
        </CardActions>
        <Collapse in={codeCellState.outputAreaVisible} timeout="auto" unmountOnExit>
          <CardContent>
            <StaleOutputBadge
              badgeContent={<Tooltip title="Stale output: re-run your code to refresh it"><SyncProblemIcon /></Tooltip>}
              color="error"
              invisible={codeCellState.outputSynced}
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
                {codeCellState.executionResponse
                  && <OutputArea executionResponse={codeCellState.executionResponse} />}
              </Card>
            </StaleOutputBadge>
          </CardContent>
        </Collapse>
      </Card>
    </Paper>
  );
}
