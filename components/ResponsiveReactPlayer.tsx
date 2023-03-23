import {
  Box,
} from '@mui/material';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

export default function ResponsiveReactPlayer(props: any) {
  return (
    <Box className="player-wrapper">
      <ReactPlayer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        className="react-player"
        width="100%"
        height="100%"
      />
    </Box>
  );
}
