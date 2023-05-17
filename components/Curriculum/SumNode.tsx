import {
  AddCircleOutline,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import { Handle, NodeProps, Position } from 'reactflow';

type NodeData = {
  width: number,
  height: number,
};

export default function SumNode({ data }: NodeProps<NodeData>) {
  const {
    width, height,
  } = data;
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <Box sx={{ width, height }}>
        <AddCircleOutline
          sx={{
            width: '100%', height: '100%', color: 'grey',
          }}
        />
      </Box>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}
