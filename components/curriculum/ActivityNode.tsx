import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import ActivityCard from './ActivityCard';
import { ActivityNodeData } from './utils';

export default function ActivityNode({
  data,
}: NodeProps<Node<ActivityNodeData>>) {
  const {
    curriculumActivity,
    curriculum,
    status,
    isUnlocked,
    width,
    height,
    id,
  } = data;

  return (
    <>
      <Handle type='target' position={Position.Top} isConnectable={false} />
      <ActivityCard
        id={id}
        curriculumActivity={curriculumActivity}
        curriculum={curriculum}
        status={status}
        isUnlocked={isUnlocked}
        width={width}
        height={height}
      />
      <Handle type='source' position={Position.Bottom} isConnectable={false} />
    </>
  );
}
