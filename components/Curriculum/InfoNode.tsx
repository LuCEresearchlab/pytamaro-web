import { Box, Typography } from '@mui/material';
import { Handle, NodeProps, Position } from 'reactflow';
import theme from '../../src/theme';

type NodeData = {
  type: 'start' | 'end';
  width: number,
  height: number,
};

export default function InfoNode({ data }: NodeProps<NodeData>) {
  const {
    type, width, height,
  } = data;
  return (
    <>
      {type !== 'start' && (
        <Handle type="target" position={Position.Top} isConnectable={false} />
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width,
          height,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          backgroundColor: theme.palette.grey[900],
        }}
      >
        <Typography variant="h5" textAlign="center" color="white" noWrap>{type.toUpperCase()}</Typography>
      </Box>
      {type !== 'end' && (
        <Handle type="source" position={Position.Bottom} isConnectable={false} />
      )}
    </>
  );
}
