import { PlayCircle } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
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
  children: React.ReactNode;
}) {
  const handleClick = () => {
    logAnalyticsEvent(AnalyticsEventName.ExternalVideo, { url });
    window.open(url, '_blank');
  };
  return (
    <Box
      onClick={handleClick}
      sx={{
        width: '100%',
        position: 'relative',
        aspectRatio: '16 / 9',
        margin: 'auto',
        overflow: 'hidden',
      }}
    >
      <Box
        component='img'
        src={thumbnail}
        alt={title}
        sx={{
          display: 'block',
          width: '100%',
          objectFit: 'cover',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
      >
        <PlayCircle
          sx={{
            color: 'white',
            fontSize: 72,
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 2,
          maxWidth: '80%',
        }}
      >
        <Typography
          variant='h6'
          sx={{
            color: 'white',
            textShadow: '0px 1px 4px rgba(0,0,0,0.7)',
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
