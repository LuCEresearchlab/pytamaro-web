import { Handle, Position } from 'reactflow';

export default function SumNode() {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div>+</div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
