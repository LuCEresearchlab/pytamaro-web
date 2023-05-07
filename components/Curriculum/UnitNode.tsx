import { Box, Typography } from '@mui/material';
import { Handle, NodeProps, Position } from 'reactflow';

type NodeData = {
  label: string;
  width?: number;
  height?: number;
  isCollapsed?: boolean;
};

export default function UnitNode({ data }: NodeProps<NodeData>) {
  return (
    <Box
      sx={{
        width: data.width,
        height: data.height,
        borderColor: 'black',
        border: 2,
        color: 'grey',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Typography variant="h2" marginY={3} align="center">
        {data.label}
      </Typography>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
}
