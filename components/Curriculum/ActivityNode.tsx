import { Handle, Position, NodeProps } from 'reactflow';
import ActivityCard from '../ActivityCard';
import { Activity } from '../../src/schemas/activitySchema';

type NodeData = {
  id: string;
  activity: Activity;
  isCompleted: boolean;
  isUnlocked: boolean;
  width: number,
  height: number,
};

export default function ActivityNode({ data }: NodeProps<NodeData>) {
  const {
    id, activity, isCompleted, isUnlocked, width, height,
  } = data;

  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <ActivityCard
        id={id}
        activity={activity}
        isCompleted={isCompleted}
        isUnlocked={isUnlocked}
        width={width}
        height={height}
      />
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}
