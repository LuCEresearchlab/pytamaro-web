import { Done, ErrorOutline, PlayCircleFilled } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Stack, Tooltip } from '@mui/material';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

export default function RunButton({
  onExecutionRequested, executing, executionFinished, executionError,
} :
{ onExecutionRequested: () => Promise<any>, executing: boolean, executionFinished: boolean,
  executionError: boolean }) {
  const { t } = useLocalTranslation(['common']);
  let buttonMessage = t('runCode');
  let buttonTooltip = ''; // Empty tooltips are not displayed
  if (executing) {
    buttonMessage = t('runningCode');
  } else if (executionFinished) {
    buttonMessage = t('doneRunningCode');
    buttonTooltip = t('alreadyExecuted');
  }
  const showPlayIcon = !executing && !executionFinished;
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Tooltip title={buttonTooltip} placement="top">
        <span>
          <LoadingButton
            onClick={onExecutionRequested}
            endIcon={showPlayIcon && <PlayCircleFilled />}
            loading={executing}
            loadingPosition={showPlayIcon || executing ? 'end' : undefined}
            variant="contained"
            sx={{ minWidth: '10rem' }}
            disabled={executing || executionFinished}
            className="run-button"
          >
            <span>{buttonMessage}</span>
          </LoadingButton>
        </span>
      </Tooltip>
      {executionFinished
      && (executionError
        ? <Tooltip title={t('executionCompletedWithErrors')} placement="right"><ErrorOutline color="error" /></Tooltip>
        : <Tooltip title={t('executionCompletedSuccessfully')} placement="right"><Done color="success" /></Tooltip>)}
    </Stack>
  );
}
