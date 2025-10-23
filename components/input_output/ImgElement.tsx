/* eslint-disable @next/next/no-img-element */
import { Fullscreen, Replay } from '@mui/icons-material';
import { Box, Button, Card, Dialog, IconButton, Tooltip } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';
import {
  isGifData,
  OUTPUT_AREA_BACKGROUND_COLOR,
  OUTPUT_ELEMENT_STYLE,
} from './OutputArea';

const CHECKERED_PATTERN = {
  '&:hover': {
    background: `repeating-conic-gradient(${theme.palette.grey[300]} 0% 25%, transparent 0 50%) 50% / ${theme.spacing(1)} ${theme.spacing(1)}`,
  },
};

export default function ImgElement({
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
