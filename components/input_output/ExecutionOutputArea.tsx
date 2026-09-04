import {
  Construction,
  KeyboardDoubleArrowUp,
  NearbyError,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Stack,
  ToggleButton,
} from '@mui/material';
import { CSSProperties, useState } from 'react';
import {
  ExecutionResponse,
  isExecutionError,
  isExecutionFailed,
} from '../../src/execution/codeExecution';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  isErrorInvolvingToolbox,
  isErrorPreviousCells,
  processTraceback,
} from '../../src/pythonTraceback';
import theme from '../../src/theme';
import FailedExecutionAlert from '../FailedExecutionAlert';
import {
  ERROR_MESSAGE_CLASSNAME,
  OUTPUT_AREA_BACKGROUND_COLOR,
  OutputArea,
  OutputAreaRef,
} from './OutputArea';
import PreElement from './PreElement';

function StderrElement({ content }: { content: string }) {
  const [showAllStackFrames, setShowAllStackFrames] = useState(false);

  const { errorLines, userTracebackLines, libraryTracebackLines, collapsed } =
    processTraceback(content);

  return (
    <div className='stderr'>
      <PreElement lines={userTracebackLines} />
      {collapsed && (
        <div>
          <ToggleButton
            value='check'
            selected={showAllStackFrames}
            onChange={() => setShowAllStackFrames(!showAllStackFrames)}
            sx={{
              paddingY: 0.5,
              marginLeft: '2ch',
              marginTop: theme.spacing(-1),
            }}
            size='small'
          >
            {`${showAllStackFrames ? 'Hide' : 'Show All '} Stack Frames`}
          </ToggleButton>
          <Collapse in={showAllStackFrames} timeout='auto' unmountOnExit>
            <PreElement lines={libraryTracebackLines} />
          </Collapse>
        </div>
      )}
      <div className={ERROR_MESSAGE_CLASSNAME}>
        <PreElement
          style={{
            fontWeight: 'bold',
            display: 'block',
          }}
          lines={errorLines}
        />
      </div>
    </div>
  );
}

function ToolboxErrorAlert() {
  const { t } = useLocalTranslation();
  return (
    <Alert severity='warning' color='error' icon={<Construction />}>
      {t('errorInvolvesToolbox')}
    </Alert>
  );
}

function PreviousCellsErrorAlert({
  buttonDisabled,
}: {
  buttonDisabled: boolean;
}) {
  const { t } = useLocalTranslation();
  return (
    <Alert
      severity='warning'
      color='error'
      icon={<NearbyError />}
      action={
        <Button
          endIcon={<KeyboardDoubleArrowUp />}
          disabled={buttonDisabled}
          color='error'
          variant='contained'
          size='small'
          sx={{
            whiteSpace: 'nowrap',
          }}
          onClick={() => {
            document
              .querySelector(
                '.pytamaro-web-code-cell:has(.monaco-editor-overlaymessage)',
              )
              ?.scrollIntoView({
                behavior: 'smooth',
              });
          }}
        >
          {t('goToError')}
        </Button>
      }
    >
      {t('errorPreviousCell')}
    </Alert>
  );
}

export default function ExecutionOutputArea({
  executionResponse,
  setOutputAreaRef,
  setIsWaitingForInput,
  firstLineNumber = 1,
  dimmed = false,
  sx = {},
  compact = false,
}: {
  executionResponse: ExecutionResponse;
  setOutputAreaRef: (node: OutputAreaRef | null | undefined) => void;
  setIsWaitingForInput: (isWaiting: boolean) => void;
  firstLineNumber?: number;
  dimmed?: boolean;
  sx?: CSSProperties;
  compact?: boolean;
}) {
  const errored = isExecutionError(executionResponse);
  const failed = isExecutionFailed(executionResponse);
  const { stdout, stderr } = executionResponse;
  return (
    <Box
      sx={{
        position: 'relative',
        overflowX: 'auto',
        minWidth: '100%',
        ...(dimmed ? { opacity: theme.palette.action.disabledOpacity } : {}),
        ...sx,
      }}
    >
      {errored && isErrorInvolvingToolbox(stderr) && <ToolboxErrorAlert />}
      {failed ? (
        <FailedExecutionAlert />
      ) : errored &&
        stderr.length > 0 &&
        isErrorPreviousCells(stderr, firstLineNumber) ? (
        <PreviousCellsErrorAlert buttonDisabled={dimmed} />
      ) : (
        <Stack sx={{ width: 'fit-content', minWidth: '100%' }}>
          {stdout.length > 0 && (
            <Box
              sx={{ backgroundColor: OUTPUT_AREA_BACKGROUND_COLOR }}
              paddingX={compact ? 2 : 3}
              paddingY={1}
            >
              <OutputArea
                data={stdout}
                disabled={dimmed}
                ref={setOutputAreaRef}
                setIsWaitingForInput={setIsWaitingForInput}
              />
            </Box>
          )}
          {stderr.length > 0 && (
            <Box
              sx={{
                backgroundColor: theme.pytamaro.palette.background.errorRed,
                color: theme.pytamaro.palette.red,
              }}
              paddingX={compact ? 2 : 3}
              paddingY={1}
            >
              <StderrElement content={stderr} />
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
