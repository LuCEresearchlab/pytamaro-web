import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  GetSmoothStepPathParams,
  Position,
} from '@xyflow/react';

interface GetSmoothStepWithPaddingPathParams extends GetSmoothStepPathParams {
  padding: number;
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
  padding = 20,
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

  const newPath = `M ${sourceX - padding} ${sourceY} L ${sourceX} ${sourceY} ${path} M ${targetX} ${targetY} L ${targetX + padding} ${targetY}`;

  return [newPath, ...other];
}

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
}: EdgeProps) {
  const [edgePath] = getSmoothStepWithPaddingPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    offset: 0,
    padding: 20,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
    </>
  );
}

const edge_type = { custom_edge: CustomEdge };

export default edge_type;
