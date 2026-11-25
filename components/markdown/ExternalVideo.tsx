import { PlayCircle } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import logAnalyticsEvent, {
  AnalyticsEventName,
} from '../../src/analyticsEvent';

export default function ExternalVideo({
  title,
  thumbnail,
  url,
  children,
}: {
  title: string;
  thumbnail: string;
  url: string;
  children: ReactNode;
}) {
  return (
    <Box
      component='a'
      href={url}
      target='_blank'
      aria-label={title}
      onClick={() =>
        logAnalyticsEvent(AnalyticsEventName.ExternalVideo, { url })
      }
      sx={{
        display: 'block',
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
        color: 'inherit',
        textDecoration: 'none',
        userSelect: 'none',
        '&:focus-visible': {
          outline: '3px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
        '&:hover, &:focus-visible': {
          '& .external-video-scrim': { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
          '& .external-video-play': { transform: 'scale(1.15)' },
          '& .external-video-caption': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        // Touch devices have no hover: keep the caption visible.
        '@media (hover: none)': {
          '& .external-video-caption': { opacity: 1, transform: 'none' },
        },
      }}
    >
      <Box
        component='img'
        src={thumbnail}
        alt={title}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      <Box
        className='external-video-scrim'
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          transition: (theme) => theme.transitions.create('background-color'),
        }}
      >
        <PlayCircle
          className='external-video-play'
          sx={{
            color: 'white',
            fontSize: 72,
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))',
            transition: (theme) => theme.transitions.create('transform'),
          }}
        />
      </Box>

      <Box
        className='external-video-caption'
        sx={{
          position: 'absolute',
          inset: 'auto 0 0 0',
          px: 2,
          pt: 4,
          pb: 2,
          background:
            'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))',
          opacity: 0,
          transform: 'translateY(8px)',
          transition: (theme) =>
            theme.transitions.create(['opacity', 'transform']),
        }}
      >
        <Typography
          variant='h6'
          sx={{
            color: 'white',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.7)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            userSelect: 'none',
          }}
        >
          {title}
        </Typography>
        {children}
      </Box>
    </Box>
  );
}
