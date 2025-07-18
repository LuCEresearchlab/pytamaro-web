import {
  BaseEdge,
  ConnectionLineComponentProps,
  EdgeProps,
  getBezierPath,
  GetSmoothStepPathParams,
  Position,
} from '@xyflow/react';
import { useStore } from '../../src/tide/store';
import { getNode } from '../../src/tide/utils';
import { TamaroCardNode } from './cards';
import { useEffect, useState } from 'react';
import { UnsoundType, Value } from '../../src/tide/language/expression';
import { getParameterName } from './cards/function';

function getValue(node: TamaroCardNode): Value | undefined {
  return node!.data.evaluated
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((node!.data as any)['value'] as Value)
    : undefined;
}
interface GetSmoothStepWithPaddingPathParams extends GetSmoothStepPathParams {
  padding: { source: number; target: number };
}

function getSmoothStepWithPaddingPath({
  sourceX,
  sourceY,
  targetX,
  targetY,
  padding = { source: 20, target: 20 },
}: GetSmoothStepWithPaddingPathParams): [
  path: string,
  labelX: number,
  labelY: number,
  offsetX: number,
  offsetY: number,
] {
  const [path, ...other] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
  });

  const newPath = `M ${sourceX - padding.source} ${sourceY} L ${sourceX} ${sourceY} ${path} M ${targetX} ${targetY} L ${targetX + padding.target} ${targetY}`;

  return [newPath, ...other];
}

function CustomEdge({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  target,
  targetHandleId,
  style,
}: EdgeProps) {
  const [primary_error, setPrimaryError] = useState(false);
  const [secondary_error, setSecondaryError] = useState(false);
  const nodes = useStore((state) => state.nodes);
  const sourceNode = getNode(nodes, source);
  const targetNode = getNode(nodes, target);

  useEffect(() => {
    if (!sourceNode || !targetNode) {
      setPrimaryError(false);
      setSecondaryError(false);
      return;
    }

    const sourceValue = getValue(sourceNode);
    const targetValue = getValue(targetNode);

    setPrimaryError(
      targetValue != null &&
        targetValue.type === UnsoundType.Bottom &&
        targetValue.error !== false &&
        (Array.isArray(targetValue.error)
          ? targetValue.error
          : [targetValue.error]
        ).find(
          (v) =>
            v.kind === 'type-error' &&
            v.args[2].value === getParameterName(targetHandleId!)!,
        ) != null,
    );

    setSecondaryError(
      !primary_error &&
        sourceValue != null &&
        sourceValue.type === UnsoundType.Bottom,
    );
  }, [
    source,
    primary_error,
    secondary_error,
    nodes,
    target,
    targetHandleId,
    sourceNode,
    targetNode,
  ]);

  const [edgePath] = getSmoothStepWithPaddingPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    offset: 0,
    padding: {
      source: 20,
      target: targetNode?.type !== 'constant_definition' ? 20 : 0,
    },
  });

  return (
    <>
      <BaseEdge
        className={`${primary_error ? 'error-main-highlight ' : ''}${secondary_error ? 'error-secondary-highlight' : ''}`}
        id={id}
        path={edgePath}
        style={style}
      />
    </>
  );
}

export function CustomEdgeLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionLineStyle,
}: Pick<
  ConnectionLineComponentProps<TamaroCardNode>,
  'fromX' | 'fromY' | 'toX' | 'toY' | 'connectionLineStyle'
>) {
  const [edgePath] = getSmoothStepWithPaddingPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    offset: 0,
    padding: {
      source: 0,
      target: 20,
    },
  });
  return <path style={connectionLineStyle} d={edgePath} />;
}

const edge_type = { custom_edge: CustomEdge };

export default edge_type;
