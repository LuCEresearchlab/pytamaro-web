import Circle from '@mui/icons-material/Circle';
import { Box, Tooltip } from '@mui/material';
import { Handle, NodeProps, Position } from 'reactflow';
import { color } from './utils';

type NodeData = {
  width: number;
  height: number;
  unlocked: boolean;
};

export default function JoinNode({ data }: NodeProps<NodeData>) {
  const { width, height, unlocked } = data;
  return (
    <Tooltip
      arrow
      title={
        unlocked ? '' : 'Complete at least one activity above to proceed below'
      }
      placement='right'
    >
      <div style={{ cursor: 'default' }}>
        <Handle type='target' position={Position.Top} isConnectable={false} />
        <Box sx={{ width, height }}>
          <Circle
            sx={{
              width: '100%',
              height: '100%',
              color: color(unlocked),
            }}
          />
        </Box>
        <Handle
          type='source'
          position={Position.Bottom}
          isConnectable={false}
        />
      </div>
    </Tooltip>
  );
}
