import { DownloadingOutlined, Keyboard, StopCircle } from '@mui/icons-material';
import Done from '@mui/icons-material/Done';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PlayCircleFilled from '@mui/icons-material/PlayCircleFilled';
import { Button, CircularProgress, Stack, Tooltip } from '@mui/material';
import { useContext } from 'react';
import { ExecutorContext } from '../src/execution/executorContext';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

function StatusIndicator({
  executing,
  isExecutingPreviousCell,
  executionFinished,
  executionError,
  isWaitingForInput,
}: {
  executing: boolean;
  isExecutingPreviousCell: boolean;
  executionFinished: boolean;
  executionError: boolean;
  isWaitingForInput: boolean;
}) {
  const { t } = useLocalTranslation(['common']);
  let tooltipTitle = '';
  let icon = <span />;
  if (executing) {
    if (isWaitingForInput) {
      tooltipTitle = t('waitingForInput');
      icon = <Keyboard fontSize='large' color='info' />;
    } else {
      tooltipTitle = t(
        isExecutingPreviousCell ? 'waitingRunningCode' : 'runningCode',
      );
      if (isExecutingPreviousCell) {
        icon = (
          <DownloadingOutlined
            fontSize='large'
            color='info'
            sx={{
              transform: 'rotate(180deg)',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              },
            }}
          />
        );
      } else {
        // CircularProgress is not an icon, but we style it so that the circle takes the same space as e.g., ErrorOutline.
        icon = (
          <CircularProgress
            enableTrackSlot={true}
            size='35px'
            style={{
              padding: '3px',
            }}
          />
        );
      }
    }
  } else if (executionFinished) {
    if (executionError) {
      tooltipTitle = t('executionCompletedWithErrors');
      icon = <ErrorOutlineOutlinedIcon fontSize='large' color='error' />;
    } else {
      tooltipTitle = t('executionCompletedSuccessfully');
      icon = <Done fontSize='large' color='success' />;
    }
  }
  if (tooltipTitle === '') {
    return icon;
  }
  return (
    <Tooltip arrow title={tooltipTitle} placement='right'>
      {icon}
    </Tooltip>
  );
}

export default function RunButton({
  enabled,
  onExecutionRequested,
  executing,
  isExecutingPreviousCell,
  executionFinished,
  executionError,
  isWaitingForInput,
  runCodeLabelKey,
}: {
  enabled: boolean;
  onExecutionRequested: () => Promise<void>;
  executing: boolean;
  isExecutingPreviousCell: boolean;
  executionFinished: boolean;
  executionError: boolean;
  isWaitingForInput: boolean;
  runCodeLabelKey: string;
}) {
  const { t } = useLocalTranslation(['common']);
  const { executorState, interruptExecution } = useContext(ExecutorContext);

  const tooltipMessage = enabled
    ? undefined
    : executorState.type === 'loading'
      ? t('executionDisabled.notReady')
      : executorState.type === 'executing'
        ? t('executionDisabled.anotherInProgress')
        : // Maybe there will be other cases here for which we may want to
          // display a reason for the disabled
          undefined;

  const stopLabel = t('stopExecution');
  const runLabel = t(runCodeLabelKey);

  const button = (
    // https://mui.com/material-ui/react-tooltip/#disabled-elements
    <div>
      <Button
        onClick={executing ? interruptExecution : onExecutionRequested}
        endIcon={executing ? <StopCircle /> : <PlayCircleFilled />}
        variant='contained'
        color={executing ? 'warning' : 'primary'}
        disabled={!enabled}
        className='run-button'
      >
        <span
          style={{
            // Keep the width constant even when the button rapidly changes between "Run" and "Stop"
            minWidth: `${Math.max(stopLabel.length, runLabel.length)}ch`,
          }}
        >
          {executing ? stopLabel : runLabel}
        </span>
      </Button>
    </div>
  );

  return (
    <Stack
      direction='row'
      spacing={2}
      sx={{
        alignItems: 'center',
      }}
    >
      {tooltipMessage !== undefined ? (
        <Tooltip arrow placement='left' title={tooltipMessage}>
          {button}
        </Tooltip>
      ) : (
        button
      )}
      <StatusIndicator
        executing={executing}
        isExecutingPreviousCell={isExecutingPreviousCell}
        executionFinished={executionFinished}
        executionError={executionError}
        isWaitingForInput={isWaitingForInput}
      />
    </Stack>
  );
}
