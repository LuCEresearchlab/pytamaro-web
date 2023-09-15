/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-array-index-key */
import { Fullscreen } from '@mui/icons-material';
import {
  Box, Button, Card, Dialog,
} from '@mui/material';
import AnsiUp from 'ansi_up';
import { isEmpty, negate } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { ExecutionResponse } from '../src/codeExecution';
import theme from '../src/theme';

function dataURIPrefix(mime: string) {
  return `data:${mime};base64,`;
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

function ImgElement({ dataURI } : { dataURI: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [showFullScreenButton, setShowFullScreenButton] = useState(false);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const imgTag = (primary = false) => {
    const style = { display: 'block', ...primary ? { maxWidth: '100%', maxHeight: '100%' } : {} };
    return <img ref={primary ? imgRef : undefined} style={style} src={dataURI} alt="Graphical output from execution result" />;
  };
  useEffect(() => {
    if (imgRef.current && boxRef.current) {
      const wantedWidth = imgRef.current.naturalWidth;
      const wantedHeight = imgRef.current.naturalHeight;
      const availableWidth = boxRef.current.clientWidth;
      const availableHeight = boxRef.current.clientHeight;
      setShowFullScreenButton(wantedWidth > availableWidth || wantedHeight > availableHeight);
    }
  }, [imgRef, boxRef, dataURI]);
  return (
    <Box
      ref={boxRef}
      sx={{
        ...OUTPUT_ELEMENT_STYLE,
        justifyContent: 'center',
        maxHeight: '600px',
        display: 'flex',
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
              variant="outlined"
              sx={{
                backgroundColor: BACKGROUND_COLOR,
                padding: theme.spacing(1),
                ...CHECKERED_PATTERN,
              }}
            >
              {imgTag()}
            </Card>
          </Dialog>
          <Button
            onClick={() => setFullScreenOpen(true)}
            variant="contained"
            size="small"
            sx={{ position: 'absolute', right: theme.spacing(2) }}
          >
            <Fullscreen />
          </Button>
        </>
      )}
      {imgTag(true)}
    </Box>
  );
}

function PreElement({ htmlContent } : { htmlContent : string }) {
  // eslint-disable-next-line react/no-danger
  return <pre style={OUTPUT_ELEMENT_STYLE} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

export default function OutputArea(
  { executionError, executionResponse }:
  { executionError: boolean, executionResponse: ExecutionResponse },
) {
  const pytamaroDataUriRegex = /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
  const htmlContent = new AnsiUp().ansi_to_html(executionResponse.content);
  return (
    <Card
      variant="outlined"
      sx={{
        backgroundColor: BACKGROUND_COLOR,
        overflowX: 'auto',
        width: '100%',
        px: 2,
        borderColor: executionError ? 'error.main' : undefined,
      }}
    >
      <div className="output-area">
        {htmlContent.split(pytamaroDataUriRegex).filter(negate(isEmpty)).map((chunk, idx) => (
          chunk.startsWith(dataURIPrefix('image/png')) || chunk.startsWith(dataURIPrefix('image/gif'))
            ? <ImgElement key={idx} dataURI={chunk} />
            : <PreElement key={idx} htmlContent={chunk} />
        ))}
      </div>
    </Card>
  );
}
