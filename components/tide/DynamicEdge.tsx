import {
  BaseEdge,
  ConnectionLineComponentProps,
  EdgeProps,
  getBezierPath,
  GetSmoothStepPathParams,
  Position,
} from '@xyflow/react';
import { useStore } from '../../src/tide/store';
import { getHandleDiv, getNode } from '../../src/tide/utils';
import { TideNode } from './cards';
import { useEffect, useState } from 'react';
import { Value } from '../../src/tide/language/expression';
import { UnsoundType } from '../../src/tide/language/typing';
import { getParameterName } from './cards/function';

function getValue(node: TideNode): Value | undefined {
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
}: Pick<
  GetSmoothStepWithPaddingPathParams,
  'sourceX' | 'sourceY' | 'targetX' | 'targetY'
>): [
  path: string,
  labelX: number,
  labelY: number,
  offsetX: number,
  offsetY: number,
] {
  return getBezierPath({
    sourceX: sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX: targetX,
    targetY,
    targetPosition: Position.Left,
  });
}

function CustomEdge({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  target,
  targetHandleId: toHandle,
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
            v.args[2].value === getParameterName(toHandle!)!,
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
    sourceNode,
    targetNode,
    toHandle,
  ]);

  const [edgePath] = getSmoothStepWithPaddingPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
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
  fromY: sourceY,
  toX,
  toY: targetY,
  connectionLineStyle,
  fromNode,
  toNode,
  fromHandle,
  toHandle,
}: Pick<
  ConnectionLineComponentProps<TideNode>,
  | 'fromX'
  | 'fromY'
  | 'toX'
  | 'toY'
  | 'connectionLineStyle'
  | 'fromNode'
  | 'toNode'
  | 'fromHandle'
  | 'toHandle'
>) {
  const sourceHandleDiv =
    getHandleDiv(fromNode.id, fromHandle.id || '')?.clientWidth || 0;
  const targetHandleDiv =
    (toNode &&
      toHandle &&
      getHandleDiv(toNode.id, toHandle.id || '')?.clientWidth) ||
    0;

  const sourceX = fromX + sourceHandleDiv / 2;
  const targetX = toX - targetHandleDiv / 2;

  const [edgePath] = getSmoothStepWithPaddingPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  return (
    <path style={{ ...connectionLineStyle, zIndex: '-1000' }} d={edgePath} />
  );
}

const edge_type = { custom_edge: CustomEdge };

export default edge_type;
