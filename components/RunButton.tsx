import Done from '@mui/icons-material/Done';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import PlayCircleFilled from '@mui/icons-material/PlayCircleFilled';
import { Button, Stack, Tooltip } from '@mui/material';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

export default function RunButton({
  enabled,
  onExecutionRequested,
  executing,
  executionFinished,
  executionError,
}: {
  enabled: boolean;
  onExecutionRequested: () => Promise<void>;
  executing: boolean;
  executionFinished: boolean;
  executionError: boolean;
}) {
  const { t } = useLocalTranslation(['common']);
  return (
    <Stack direction='row' spacing={2} alignItems='center'>
      <Button
        onClick={onExecutionRequested}
        endIcon={!executing && <PlayCircleFilled />}
        loading={executing}
        loadingPosition='end'
        variant='contained'
        disabled={!enabled || executing}
        className='run-button'
        sx={{
          px: 3,
        }}
      >
        <span>{t('runCode')}</span>
      </Button>
      {!executing &&
        executionFinished &&
        (executionError ? (
          <Tooltip
            arrow
            title={t('executionCompletedWithErrors')}
            placement='right'
          >
            <ErrorOutline fontSize='large' color='error' />
          </Tooltip>
        ) : (
          <Tooltip
            arrow
            title={t('executionCompletedSuccessfully')}
            placement='right'
          >
            <Done fontSize='large' color='success' />
          </Tooltip>
        ))}
    </Stack>
  );
}
