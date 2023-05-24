import { Box, Typography } from '@mui/material';
import { Handle, NodeProps, Position } from 'reactflow';
import { slug } from 'github-slugger';

type NodeData = {
  type: 'unit' | 'start' | 'end',
  text: string,
  width: number,
  height: number,
  unlocked: boolean,
};

export default function TitleNode({ data }: NodeProps<NodeData>) {
  const {
    type, text, width, height, unlocked,
  } = data;
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
        {type === 'unit'
          ? <Typography variant="h5" textAlign="center" noWrap>{text}</Typography>
          : <Typography variant="h6" textTransform="uppercase" letterSpacing=".08rem" textAlign="center" noWrap>{text}</Typography>}
      </Box>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </Box>
  );
}
