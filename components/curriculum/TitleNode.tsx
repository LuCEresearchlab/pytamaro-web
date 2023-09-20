import { AssignmentTurnedIn, PlayCircle } from '@mui/icons-material';
import {
  Box, Button, Tooltip, Typography,
} from '@mui/material';
import { slug } from 'github-slugger';
import { Handle, NodeProps, Position } from 'reactflow';

type NodeData = {
  type: 'unit' | 'start' | 'end',
  text: string,
  width: number,
  height: number,
  unlocked: boolean,
  started?: boolean,
  onStartClick?: () => void,
  onEndClick?: () => void,
};

export default function TitleNode({ data }: NodeProps<NodeData>) {
  const {
    type, text, width, height, unlocked, started, onStartClick, onEndClick,
  } = data;
  const showStartingButton = type === 'start' && !started;
  const showFinishButton = type === 'end' && unlocked;
  return (
    <Box sx={{ opacity: unlocked ? 1 : 0.38 }}>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width,
          height,
          overflow: 'initial !important',
          textOverflow: 'ellipsis',
          backgroundColor: type === 'unit' ? '#aed9e7' : 'transparent',
        }}
        className={type === 'unit' ? 'curriculum-unit' : undefined}
        id={slug(text)}
      >
        {/* eslint-disable-next-line no-nested-ternary */}
        {showStartingButton || showFinishButton ? (
          <Tooltip title={`Click to ${showStartingButton ? 'Start' : 'Finish'}`} placement="top" arrow>
            <Button
              variant="contained"
              color="success"
              onClick={showStartingButton ? onStartClick : onEndClick}
              startIcon={showStartingButton ? <PlayCircle /> : <AssignmentTurnedIn />}
            >
              {text}
            </Button>
          </Tooltip>
        ) : (
          type === 'unit'
            ? <Typography variant="h5" textAlign="center" noWrap>{text}</Typography>
            : <Typography variant="h6" textTransform="uppercase" letterSpacing=".08rem" textAlign="center" noWrap>{text}</Typography>
        )}
      </Box>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </Box>
  );
}
