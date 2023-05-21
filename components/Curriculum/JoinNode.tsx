import {
  Circle,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import { Handle, NodeProps, Position } from 'reactflow';

type NodeData = {
  width: number,
  height: number,
};

export default function JoinNode({ data }: NodeProps<NodeData>) {
  const {
    width, height,
  } = data;
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <Box sx={{ width, height }}>
        <Circle
          sx={{
            width: '100%', height: '100%', color: '#aed9e7',
          }}
        />
      </Box>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}
