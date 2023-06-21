import { Done, ErrorOutline, PlayCircleFilled } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Stack, Tooltip } from '@mui/material';

export default function RunButton({
  onExecutionRequested, executing, executionFinished, executionError,
} :
{ onExecutionRequested: () => Promise<any>, executing: boolean, executionFinished: boolean,
  executionError: boolean }) {
  let buttonMessage = 'Run';
  let buttonTooltip = ''; // Empty tooltips are not displayed
  if (executing) {
    buttonMessage = 'Running';
  } else if (executionFinished) {
    buttonMessage = 'Done';
    buttonTooltip = 'Already executed: change the code to run again';
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
        ? <Tooltip title="Execution completed with errors" placement="right"><ErrorOutline color="error" /></Tooltip>
        : <Tooltip title="Execution completed successfully" placement="right"><Done color="success" /></Tooltip>)}
    </Stack>
  );
}
