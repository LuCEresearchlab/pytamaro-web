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
import { CSSProperties, RefObject, useState } from 'react';
import { CompletedExecutionResponse } from '../../src/codeExecution';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import {
  isErrorInvolvingToolbox,
  isErrorPreviousCells,
  processTraceback,
} from '../../src/pythonTraceback';
import theme from '../../src/theme';
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
    <div>
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
  executionError,
  executionResponse,
  outputAreaRef,
  dimmed = false,
  sx = {},
}: {
  executionError: boolean;
  executionResponse: CompletedExecutionResponse;
  outputAreaRef: RefObject<OutputAreaRef | null>;
  dimmed?: boolean;
  sx?: CSSProperties;
}) {
  const { stdout, stderr } = executionResponse;
  return (
    <Box
      sx={{
        position: 'relative',
        overflowX: 'auto',
        minWidth: '100%',
        marginTop: 1,
        ...(dimmed ? { opacity: theme.palette.action.disabledOpacity } : {}),
        ...sx,
      }}
    >
      {executionError && isErrorInvolvingToolbox(stderr) && (
        <ToolboxErrorAlert />
      )}
      {executionError && stderr && isErrorPreviousCells(stderr) ? (
        <PreviousCellsErrorAlert buttonDisabled={dimmed} />
      ) : (
        <Stack sx={{ width: 'fit-content', minWidth: '100%' }}>
          {stdout && (
            <Box
              sx={{ backgroundColor: OUTPUT_AREA_BACKGROUND_COLOR }}
              paddingX={3}
              paddingY={1}
            >
              <OutputArea data={stdout} disabled={dimmed} ref={outputAreaRef} />
            </Box>
          )}
          {stderr && (
            <Box
              sx={{
                backgroundColor: theme.pytamaro.palette.background.errorRed,
                color: theme.pytamaro.palette.red,
              }}
              paddingX={3}
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
