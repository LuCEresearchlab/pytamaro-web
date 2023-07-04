import { Handle, NodeProps, Position } from 'reactflow';
import ActivityCard from './ActivityCard';
import { ActivityNodeData } from './utils';

export default function ActivityNode({ data }: NodeProps<ActivityNodeData>) {
  const {
    curriculumActivity, curriculum, status, isUnlocked, width, height,
  } = data;

  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <ActivityCard
        curriculumActivity={curriculumActivity}
        curriculum={curriculum}
        status={status}
        isUnlocked={isUnlocked}
        width={width}
        height={height}
      />
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}
