import { Handle, Position, NodeProps } from 'reactflow';
import ActivityCard from './ActivityCard';
import { ActivityNodeData } from './utils';

export default function ActivityNode({ data }: NodeProps<ActivityNodeData>) {
  const {
    id, activity, curriculum, isCompleted, isUnlocked, width, height,
  } = data;

  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <ActivityCard
        id={id}
        activity={activity}
        curriculum={curriculum}
        isCompleted={isCompleted}
        isUnlocked={isUnlocked}
        width={width}
        height={height}
      />
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}
