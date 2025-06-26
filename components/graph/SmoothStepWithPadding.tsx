import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  GetSmoothStepPathParams,
  Position,
} from '@xyflow/react';
import { useStore } from './store';
import { getNode } from './utils';

interface GetSmoothStepWithPaddingPathParams extends GetSmoothStepPathParams {
  padding: { source: number; target: number };
}

function getSmoothStepWithPaddingPath({
  sourceX,
  sourceY,
  sourcePosition = Position.Bottom,
  targetX,
  targetY,
  targetPosition = Position.Top,
  borderRadius = 5,
  centerX,
  centerY,
  padding = { source: 20, target: 20 },
  offset = 20,
}: GetSmoothStepWithPaddingPathParams): [
  path: string,
  labelX: number,
  labelY: number,
  offsetX: number,
  offsetY: number,
] {
  const [path, ...other] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius,
    centerX,
    centerY,
    offset,
  });

  const newPath = `M ${sourceX - padding.source} ${sourceY} L ${sourceX} ${sourceY} ${path} M ${targetX} ${targetY} L ${targetX + padding.target} ${targetY}`;

  return [newPath, ...other];
}

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  target,
  style,
}: EdgeProps) {
  const { getNodes } = useStore();

  const node = getNode(getNodes(), target)!;

  const [edgePath] = getSmoothStepWithPaddingPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    offset: 0,
    padding: {
      source: 20,
      target: node?.type !== 'constant_definition' ? 20 : 0,
    },
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
    </>
  );
}

const edge_type = { custom_edge: CustomEdge };

export default edge_type;
