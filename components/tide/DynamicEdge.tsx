/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  BaseEdge,
  ConnectionLineComponentProps,
  EdgeProps,
  getBezierPath,
  GetSmoothStepPathParams,
  Position,
} from '@xyflow/react';
import { useEffect, useState } from 'react';
import {
  ErrorType,
  EvaluatedValueType,
  SoundType,
} from '../../src/tide/language/typing';
import { extract_error } from '../../src/tide/language/utils';
import { useStore } from '../../src/tide/store';
import { getNode } from '../../src/tide/utils';
import { TideNode } from './cards';
import { getParameterName } from './cards/function';

export function getValue(
  node: TideNode['data'],
): EvaluatedValueType[SoundType] | ErrorType | false | undefined {
  const value =
    node.tide_node && 'type' in node.tide_node
      ? 'data' in node.tide_node
        ? (node.tide_node.data as EvaluatedValueType[SoundType])
        : 'error_phase' in node.tide_node
          ? (node.tide_node.type as ErrorType | false)
          : undefined
      : undefined;
  return value;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sourceError = extract_error(sourceNode.data.tide_node as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetError = extract_error(targetNode.data.tide_node as any);

    setPrimaryError(
      sourceError != null &&
        targetError != null &&
        typeof targetError === 'object' &&
        'error' in targetError &&
        (Array.isArray(targetError.error)
          ? targetError.error
          : [targetError.error]
        ).find(
          (v) =>
            v.kind === 'type-error' &&
            v.args[2].value === getParameterName(toHandle!)!,
        ) != null,
    );

    setSecondaryError(
      !primary_error && sourceError != null && targetError != null,
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
  fromY,
  toX,
  toY,
  connectionLineStyle,
  fromHandle,
  toHandle,
}: Pick<
  ConnectionLineComponentProps<TideNode>,
  | 'fromX'
  | 'fromY'
  | 'toX'
  | 'toY'
  | 'connectionLineStyle'
  | 'fromHandle'
  | 'toHandle'
>) {
  const fromWidth = fromHandle.width || 0;
  const toWidth = toHandle?.width || 0;
  const [edgePath] = getSmoothStepWithPaddingPath(
    fromHandle.type === 'source'
      ? {
          sourceX: fromX + fromWidth / 2,
          sourceY: fromY,
          targetX: toX - toWidth / 2,
          targetY: toY,
        }
      : {
          sourceX: toX + toWidth / 2,
          sourceY: toY,
          targetX: fromX - fromWidth / 2,
          targetY: fromY,
        },
  );
  return (
    <path style={{ ...connectionLineStyle, zIndex: '-1000' }} d={edgePath} />
  );
}

const edge_type = { custom_edge: CustomEdge };

export default edge_type;
