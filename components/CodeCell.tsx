import { useTheme, styled } from '@mui/material/styles';
import {
  Badge,
  BadgeProps,
  Card, CardActions, CardContent, Collapse, IconButton, ListItemIcon, Menu, MenuItem, Paper,
  Tooltip,
} from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import DoneIcon from '@mui/icons-material/Done';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import LoadingButton from '@mui/lab/LoadingButton';
import Editor from '@monaco-editor/react';
import { editor as EditorNamespace } from 'monaco-editor';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import {
  ContentCopy, RestartAlt, Visibility, VisibilityOff,
} from '@mui/icons-material';
import OutputArea from './OutputArea';
import { CodeCellState } from '../src/localStorage/schema';

const StaleOutputBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  width: '100%',
}));

export function MoreOptions({ codeCellState, onShowHideOutput, onReset } :
{ codeCellState: CodeCellState, onShowHideOutput: () => void, onReset: () => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCopy = () => {
    handleClose();
    navigator.clipboard.writeText(codeCellState.source);
  };
  const handleShowHideOutputArea = () => {
    handleClose();
    onShowHideOutput();
  };
  const handleReset = () => {
    handleClose();
    onReset();
  };
  return (
    <>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ marginLeft: 'auto' }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          },
        }}
      >
        <MenuItem onClick={handleReset}>
          <ListItemIcon>
            <RestartAlt fontSize="small" />
          </ListItemIcon>
          Reset Cell
        </MenuItem>
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          Copy Code
        </MenuItem>
        { codeCellState.executionResponse && (
        <MenuItem onClick={handleShowHideOutputArea}>
          <ListItemIcon>
            { codeCellState.outputAreaVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </ListItemIcon>
          { codeCellState.outputAreaVisible ? 'Hide' : 'Show' }
          {' '}
          Output
        </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default function CodeCell({
  codeCellState, onSourceChanged, onExecutionRequested, onOutputAreaToggled,
  onReset, firstLineNumber,
} :
{ codeCellState : CodeCellState,
  onSourceChanged: (newSource: string) => void,
  onExecutionRequested: () => Promise<any>,
  onOutputAreaToggled: () => void,
  onReset: () => void,
  firstLineNumber : number,
}) {
  const theme = useTheme();

  const handleEditorMount = (editor: EditorNamespace.IStandaloneCodeEditor) => {
    const updateHeight = () => {
      editor.layout({ width: editor.getLayoutInfo().width, height: editor.getContentHeight() });
    };
    editor.onDidContentSizeChange(updateHeight);
  };

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
          <Editor
            language="python"
            value={codeCellState.source}
            onChange={(value) => value && onSourceChanged(value)}
            options={{
              fontFamily: theme.pytamaro.monospaceFontFamily,
              fontSize: 1.1 * theme.typography.fontSize,
              lineNumbers: (n) => (n + firstLineNumber - 1).toString(10),
              lineNumbersMinChars: 2,
              minimap: { enabled: false },
              renderLineHighlight: 'none',
              overviewRulerLanes: 0,
              scrollBeyondLastLine: false,
            }}
            onMount={handleEditorMount}
          />
        </CardContent>
        <CardActions disableSpacing sx={{ paddingLeft: 2, display: 'flex' }}>
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
          <MoreOptions
            codeCellState={codeCellState}
            onShowHideOutput={onOutputAreaToggled}
            onReset={onReset}
          />
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
