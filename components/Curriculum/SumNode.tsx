import {
  AddCircleOutline,
} from '@mui/icons-material';
import { Handle, Position } from 'reactflow';

export default function SumNode() {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <AddCircleOutline
        sx={{ margin: -2, fontSize: 80, color: 'grey' }}
      />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
