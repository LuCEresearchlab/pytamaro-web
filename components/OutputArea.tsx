/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-array-index-key */
import {
  KeyboardDoubleArrowUp,
  NearbyError,
  Replay,
} from '@mui/icons-material';
import Construction from '@mui/icons-material/Construction';
import Fullscreen from '@mui/icons-material/Fullscreen';
import {
  Alert,
  Box,
  Button,
  Card,
  Collapse,
  Dialog,
  IconButton,
  Stack,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import { isEmpty, negate } from 'lodash';
import {
  CSSProperties,
  ReactElement,
  Ref,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { CompletedExecutionResponse } from '../src/codeExecution';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  isErrorInvolvingToolbox,
  isErrorPreviousCells,
  processTraceback,
} from '../src/pythonTraceback';
import { splitLines } from '../src/sourceUtils';
import theme from '../src/theme';
import InputArea from './InputArea';

function dataURIPrefix(mime: string) {
  return `data:${mime};base64,`;
}

function isPngData(data: string) {
  return data.startsWith(dataURIPrefix('image/png'));
}

function isGifData(data: string) {
  return data.startsWith(dataURIPrefix('image/gif'));
}

export const OUTPUT_AREA_BACKGROUND_COLOR = theme.palette.grey[100];

const OUTPUT_ELEMENT_STYLE = {
  display: 'block',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
};

const CHECKERED_PATTERN = {
  '&:hover': {
    background: `repeating-conic-gradient(${theme.palette.grey[300]} 0% 25%, transparent 0 50%) 50% / ${theme.spacing(1)} ${theme.spacing(1)}`,
  },
};

function ImgElement({
  dataURI,
  disabled,
}: {
  dataURI: string;
  disabled: boolean;
}) {
  const { t } = useLocalTranslation();
  const [availableSize, setAvailableSize] = useState([0, 0]);
  const [wantedSize, setWantedSize] = useState([0, 0]);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const showFullScreenButton =
    wantedSize[0] > availableSize[0] || wantedSize[1] > availableSize[1];

  // Monitor the size of the box containing the image to determine if we need to show the
  // full screen button.
  // The size potentially changes when a new image is loaded or the window is resized.
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!boxRef.current) return () => {};
    const observer = new ResizeObserver(() => {
      if (boxRef.current) {
        setAvailableSize([
          boxRef.current.clientWidth,
          boxRef.current.clientHeight,
        ]);
      }
    });
    observer.observe(boxRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  const resetGif = () => {
    const img = boxRef.current?.querySelector('img');
    if (img) {
      img.src = dataURI;
    }
  };

  const imgTag = (mainImage: boolean) => {
    const baseStyle = {
      display: 'block',
      maxWidth: '100%',
      objectFit: 'scale-down' as const,
    };
    const dialogStyle = {
      ...baseStyle,
      maxWidth: `calc(100vw - ${theme.spacing(16)})`,
      maxHeight: `calc(100vh - ${theme.spacing(16)})`,
    };
    return (
      <img
        onLoad={(ev) => {
          // Measure the image "natural" size after it has been loaded.
          if (mainImage) {
            const img = ev.target as HTMLImageElement;
            setWantedSize([img.naturalWidth, img.naturalHeight]);
          }
        }}
        style={mainImage ? baseStyle : dialogStyle}
        src={dataURI}
        alt='Graphical output from execution result'
      />
    );
  };

  return (
    <Box
      ref={boxRef}
      sx={{
        ...OUTPUT_ELEMENT_STYLE,
        justifyContent: 'center',
        maxWidth: '100%',
        maxHeight: '600px',
        display: 'flex',
        position: 'relative',
        padding: theme.spacing(0.5),
        ...CHECKERED_PATTERN,
      }}
    >
      {showFullScreenButton && (
        <>
          <Dialog
            onClose={() => setFullScreenOpen(false)}
            open={fullScreenOpen}
            maxWidth={false}
          >
            <Card
              variant='outlined'
              sx={{
                backgroundColor: OUTPUT_AREA_BACKGROUND_COLOR,
                padding: theme.spacing(1),
                ...CHECKERED_PATTERN,
              }}
            >
              {imgTag(false)}
            </Card>
          </Dialog>
          <Button
            onClick={() => setFullScreenOpen(true)}
            variant='contained'
            size='small'
            sx={{ position: 'absolute', right: 0, top: 0 }}
            disabled={disabled}
          >
            <Fullscreen />
          </Button>
        </>
      )}
      {isGifData(dataURI) && (
        <Tooltip arrow title={t('restartAnimation')}>
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
            }}
            onClick={resetGif}
            size='small'
            disabled={disabled}
          >
            <Replay />
          </IconButton>
        </Tooltip>
      )}
      {imgTag(true)}
    </Box>
  );
}

function PreElement({
  style = {},
  lines,
  input = undefined,
}: {
  style?: CSSProperties;
  lines: string[];
  input?: ReactElement | undefined;
}) {
  return (
    <span style={OUTPUT_ELEMENT_STYLE}>
      {lines.map((line, idx, lines) => {
        const needsInput = idx === lines.length - 1 && input;
        const lineElement = (
          <pre
            key={line}
            style={{
              margin: 0,
              display: needsInput ? 'inline-block' : 'block',
              ...style,
            }}
          >
            {line}
          </pre>
        );
        return needsInput ? (
          <>
            {lineElement}
            {input}
          </>
        ) : (
          lineElement
        );
      })}
    </span>
  );
}

export const ERROR_MESSAGE_CLASSNAME = 'traceback-error-message';

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

export type OutputAreaRef = {
  getInput: () => Promise<string>;
  activateInputField: () => void;
};

export function OutputArea({
  data,
  disabled = false,
  sx = {},
  preStyle = {},
  ref = undefined,
}: {
  data: string;
  disabled?: boolean;
  sx?: CSSProperties;
  preStyle?: CSSProperties;
  ref?: Ref<OutputAreaRef>;
}) {
  const resolveInputPromiseRef = useRef<((value: string) => void) | undefined>(
    undefined,
  );
  const [inputFieldActive, setInputFieldActive] = useState(false);
  useImperativeHandle(ref, () => {
    return {
      getInput() {
        return new Promise<string>((resolve) => {
          resolveInputPromiseRef.current = resolve;
        });
      },
      activateInputField() {
        setInputFieldActive(true);
      },
    };
  }, []);
  const pytamaroDataUriRegex =
    /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
  return (
    <div className='output-area' translate='no' style={sx}>
      {data
        .split(pytamaroDataUriRegex)
        .filter(negate(isEmpty))
        .map((chunk, idx, chunks) =>
          isPngData(chunk) || isGifData(chunk) ? (
            <ImgElement key={idx} dataURI={chunk} disabled={disabled} />
          ) : (
            <PreElement
              key={idx}
              lines={splitLines(chunk)}
              style={preStyle}
              input={
                idx === chunks.length - 1 && inputFieldActive ? (
                  <InputArea
                    onSubmit={(result) => {
                      if (resolveInputPromiseRef.current) {
                        setInputFieldActive(false);
                        resolveInputPromiseRef.current(result);
                      }
                    }}
                  />
                ) : undefined
              }
            />
          ),
        )}
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
