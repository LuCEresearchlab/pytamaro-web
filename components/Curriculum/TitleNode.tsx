import { Box, Typography } from '@mui/material';
import { Handle, NodeProps, Position } from 'reactflow';

type NodeData = {
  title: string,
  width: number,
  height: number,
};

export default function TitleNode({ data }: NodeProps<NodeData>) {
  const {
    title, width, height,
  } = data;
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width,
          height,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          backgroundColor: '#aed9e7',
        }}
      >
        <Typography variant="h5" textAlign="center" noWrap>{title}</Typography>
      </Box>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}
