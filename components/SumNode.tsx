import { Card, Paper, Typography } from '@mui/material';
import { Handle, Position } from 'reactflow';

export default function SumNode() {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Paper elevation={8}>
        <Card>
          <Typography variant="h3" margin={1} align="center">
            +
          </Typography>
        </Card>
      </Paper>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
