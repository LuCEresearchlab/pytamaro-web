import { Keyboard, StopCircle } from '@mui/icons-material';
import Done from '@mui/icons-material/Done';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import PlayCircleFilled from '@mui/icons-material/PlayCircleFilled';
import { Button, CircularProgress, Stack, Tooltip } from '@mui/material';
import { useContext } from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { ExecutorContext } from '../src/pyodide-execution/pyodideWorkerClient';

function StatusIndicator({
  executing,
  executionFinished,
  executionError,
  isWaitingForInput,
}: {
  executing: boolean;
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
      tooltipTitle = t('runningCode');
      // CircularProgress is not an icon, but we set it to be the same size as actual icons
      icon = <CircularProgress size='35px' />;
    }
  } else if (executionFinished) {
    if (executionError) {
      tooltipTitle = t('executionCompletedWithErrors');
      icon = <ErrorOutline fontSize='large' color='error' />;
    } else {
      tooltipTitle = t('executionCompletedSuccessfully');
      icon = <Done fontSize='large' color='success' />;
    }
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
  executionFinished,
  executionError,
  isWaitingForInput,
}: {
  enabled: boolean;
  onExecutionRequested: () => Promise<void>;
  executing: boolean;
  executionFinished: boolean;
  executionError: boolean;
  isWaitingForInput: boolean;
}) {
  const { t } = useLocalTranslation(['common']);
  const { isReady, activeExecutionInfo, interruptExecution } =
    useContext(ExecutorContext);

  const isExecuting = activeExecutionInfo !== null;

  let tooltipMessage = undefined;
  if (!enabled) {
    if (!isReady) {
      tooltipMessage = t('executionDisabled.notReady');
    } else if (isExecuting) {
      tooltipMessage = t('executionDisabled.anotherInProgress');
    }
    // Maybe there are other cases here for which we may want to display a reason for the disabled
  }

  return (
    <Stack direction='row' spacing={2} alignItems='center'>
      <Tooltip arrow placement='left' title={tooltipMessage}>
        {/* https://mui.com/material-ui/react-tooltip/#disabled-elements */}
        <div>
          <Button
            onClick={executing ? interruptExecution : onExecutionRequested}
            endIcon={executing ? <StopCircle /> : <PlayCircleFilled />}
            variant='contained'
            color={executing ? 'warning' : 'primary'}
            disabled={!enabled}
            className='run-button'
          >
            <span>{t(executing ? 'stopExecution' : 'runCode')}</span>
          </Button>
        </div>
      </Tooltip>
      <StatusIndicator
        executing={executing}
        executionFinished={executionFinished}
        executionError={executionError}
        isWaitingForInput={isWaitingForInput}
      />
    </Stack>
  );
}
