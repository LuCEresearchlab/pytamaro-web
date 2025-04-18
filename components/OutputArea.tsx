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
  ToggleButton,
  Tooltip,
} from '@mui/material';
import { isEmpty, negate } from 'lodash';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { CompletedExecutionResponse } from '../src/codeExecution';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  isErrorInvolvingToolbox,
  isErrorPreviousCells,
  processTraceback,
} from '../src/pythonTraceback';
import { joinLines, splitLines } from '../src/sourceUtils';
import theme from '../src/theme';

function dataURIPrefix(mime: string) {
  return `data:${mime};base64,`;
}

function isPngData(data: string) {
  return data.startsWith(dataURIPrefix('image/png'));
}

function isGifData(data: string) {
  return data.startsWith(dataURIPrefix('image/gif'));
}

const BACKGROUND_COLOR = theme.palette.grey[50];

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
                backgroundColor: BACKGROUND_COLOR,
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

function SinglePreElement({
  style = {},
  lines,
}: {
  style?: CSSProperties;
  lines: string[];
}) {
  return (
    <pre style={{ ...OUTPUT_ELEMENT_STYLE, ...style }}>{joinLines(lines)}</pre>
  );
}

function CodeElement({ content }: { content: string }) {
  const [showAllStackFrames, setShowAllStackFrames] = useState(false);

  const { errorLines, userTracebackLines, libraryTracebackLines, collapsed } =
    processTraceback(content);

  return (
    <div>
      <SinglePreElement lines={userTracebackLines} />
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
            <SinglePreElement lines={libraryTracebackLines} />
          </Collapse>
        </div>
      )}
      <SinglePreElement style={{ fontWeight: 'bold' }} lines={errorLines} />
    </div>
  );
}

export function OutputArea({
  data,
  disabled = false,
  sx = {},
  preStyle = {},
}: {
  data: string;
  disabled?: boolean;
  sx?: CSSProperties;
  preStyle?: CSSProperties;
}) {
  const pytamaroDataUriRegex =
    /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
  return (
    <div className='output-area' translate='no' style={sx}>
      {data
        .split(pytamaroDataUriRegex)
        .filter(negate(isEmpty))
        .map((chunk, idx) =>
          isPngData(chunk) || isGifData(chunk) ? (
            <ImgElement key={idx} dataURI={chunk} disabled={disabled} />
          ) : (
            <SinglePreElement
              key={idx}
              lines={splitLines(chunk)}
              style={preStyle}
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
                '.pytamaro-web-code-cell:has(.monaco-editor .zone-widget)',
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
  dimmed = false,
  sx = {},
}: {
  executionError: boolean;
  executionResponse: CompletedExecutionResponse;
  dimmed?: boolean;
  sx?: CSSProperties;
}) {
  const { stdout, stderr } = executionResponse;
  return (
    <Card
      variant='outlined'
      sx={{
        backgroundColor: BACKGROUND_COLOR,
        position: 'relative',
        overflowX: 'auto',
        width: '100%',
        borderColor: executionError ? 'error.main' : undefined,
        ...(dimmed ? { opacity: theme.palette.action.disabledOpacity } : {}),
        ...sx,
      }}
    >
      {isErrorInvolvingToolbox(stderr) && <ToolboxErrorAlert />}
      {stderr && isErrorPreviousCells(stderr) ? (
        <PreviousCellsErrorAlert buttonDisabled={dimmed} />
      ) : (
        <Box sx={{ px: 2 }}>
          <OutputArea data={stdout} disabled={dimmed} />
          {stderr && <CodeElement content={stderr} />}
        </Box>
      )}
    </Card>
  );
}
