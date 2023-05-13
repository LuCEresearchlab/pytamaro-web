import { Handle, Position, NodeProps } from 'reactflow';
import ActivityCard from '../ActivityCard';
import { Activity, NotebookVariant } from '../../src/schemas/activitySchema';

type NodeData = {
  id: string;
  activity: Activity;
  variant: NotebookVariant;
  isCompleted: boolean;
  isUnlocked: boolean;
  width: number,
  height: number,
};

export default function ActivityNode({ data }: NodeProps<NodeData>) {
  const {
    id, activity, variant, isCompleted, isUnlocked, width, height,
  } = data;

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <ActivityCard
        id={id}
        activity={activity}
        variant={variant}
        isCompleted={isCompleted}
        isUnlocked={isUnlocked}
        width={width}
        height={height}
      />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
