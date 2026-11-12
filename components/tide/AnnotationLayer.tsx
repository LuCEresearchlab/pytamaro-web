/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  InternalNode,
  useStore as useFlowStore,
  useReactFlow,
  ViewportPortal,
  XYPosition,
} from '@xyflow/react';
import { JSX } from 'react';
import { TideError, TideRuntimeError } from '../../src/tide/language/errors';
import { ErrorType } from '../../src/tide/language/typing';
import { extract_error } from '../../src/tide/language/utils';
import { StoreType, useStore } from '../../src/tide/store';
import { getHandleName } from '../../src/tide/utils';
import { ErrorBubble } from './Bubble';
import { TideNode, TideNodeMetadata } from './cards';
import { ErrorParagraph } from './ErrorParagraph';

const MISSING_PARAMETER = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 30 10'
    width='30px'
    height='10px'
  >
    <rect
      width='30'
      height='10'
      fill='rgb(255, 225, 130)'
      rx='5'
      ry='5'
      transform='matrix(1, 0, 0, 1, -7.105427357601002e-15, -3.552713678800501e-15)'
    />
    <ellipse
      fill='rgb(230, 130, 50)'
      cx='5'
      cy='5'
      rx='2'
      ry='2'
      transform='matrix(1, 0, 0, 1, -7.105427357601002e-15, -3.552713678800501e-15)'
    />
    <ellipse
      fill='rgb(230, 130, 50)'
      cx='18.334'
      cy='5'
      rx='2'
      ry='2'
      transform='matrix(1, 0, 0, 1, -7.105427357601002e-15, -3.552713678800501e-15)'
    />
    <ellipse
      fill='rgb(230, 130, 50)'
      cx='11.667'
      cy='5'
      rx='2'
      ry='2'
      transform='matrix(1, 0, 0, 1, -7.105427357601002e-15, -3.552713678800501e-15)'
    />
  </svg>
);

export function createAnnotationComponents(
  store: StoreType,
  [{ node_id }, annotation]: [TideNodeMetadata, TideError],
  getInternalNode: (id: string) => InternalNode<TideNode> | undefined,
): JSX.Element[] {
  const { edges, mousePosition } = store;

  const param =
    (annotation.kind === 'syntax-error'
      ? annotation.subkind === 'missing_parameter'
        ? annotation.args[0].value
        : undefined
      : undefined) ||
    (annotation.kind === 'type-error' ? annotation.args[2].value : undefined);
  const position = 'target';

  function getHandlePosition(
    node_id: string,
    handle_id: string,
    type: 'source' | 'target',
  ): XYPosition | undefined {
    const node = getInternalNode(node_id);
    const handle = node?.internals.handleBounds?.[type]?.find(
      (v) => v.id === handle_id,
    );
    if (!node || !handle) return undefined;

    return {
      x: node.internals.positionAbsolute.x + handle.x + handle.width / 2,
      y: node.internals.positionAbsolute.y + handle.y + handle.height / 2,
    };
  }

  function getPosition(
    node_id: string,
    handle: string | undefined,
    position: 'target' | 'middle' | 'source' | undefined,
  ): XYPosition | undefined {
    if (!handle || !position) {
      const node = getInternalNode(node_id);
      if (!node) return undefined;

      return {
        x: node.internals.positionAbsolute.x + (node.measured.width || 0) / 3,
        y: node.internals.positionAbsolute.y,
      };
    }

    if (position === 'target')
      return getHandlePosition(node_id, getHandleName(handle), 'target');

    const edge = edges.find(
      (v) => v.target === node_id && v.targetHandle === getHandleName(handle),
    );
    if (!edge) return undefined;

    const source_position = getHandlePosition(
      edge.source,
      edge.sourceHandle || 'output',
      'source',
    );
    if (position === 'source') return source_position;

    // position === 'middle'
    const target_position = getHandlePosition(
      edge.target,
      edge.targetHandle || getHandleName(handle),
      'target',
    );
    if (!source_position || !target_position) return undefined;

    return {
      x: (source_position.x + target_position.x) / 2,
      y: (source_position.y + target_position.y) / 2,
    };
  }

  const node = getInternalNode(node_id);
  const target_position = getPosition(node_id, param, position);
  if (!target_position) return [];
  const source_position = getPosition(node_id, param, 'source');

  const NODE_PADDING = 10;
  const node_position = node?.internals.positionAbsolute;
  const node_width = node?.measured.width || 0;
  const node_height = node?.measured.height || 0;
  const isNearEnough =
    param === undefined
      ? node?.selected ||
        (mousePosition.x + NODE_PADDING > (node_position?.x || 0) &&
          mousePosition.x - NODE_PADDING <
            (node_position?.x || 0) + node_width &&
          mousePosition.y + NODE_PADDING > (node_position?.y || 0) &&
          mousePosition.y - NODE_PADDING <
            (node_position?.y || 0) + node_height)
      : Math.abs(mousePosition.x - target_position.x + 50) < 100 &&
        Math.abs(mousePosition.y - target_position.y) < 35;

  const key = `${node_id}_${param}_${position}_${annotation.args.map((v) => v.value + '_' + v.value).join('_')}`;
  return [
    <div
      style={{
        position: 'absolute',
        transform: `translate(${target_position.x - 5}px, ${target_position.y - 5}px)`,
        zIndex: '10000',
      }}
      key={key}
    >
      <div
        style={{
          transform: 'scale(0.35)',
          transformOrigin: 'top left',
          opacity: isNearEnough ? '1' : '0',
        }}
      >
        <ErrorBubble>
          <ErrorParagraph annotation={annotation} />
        </ErrorBubble>
      </div>
    </div>,

    annotation.kind === 'type-error' ? (
      <div
        style={{
          position: 'absolute',
          transform: `translate(${target_position.x + 12}px, ${target_position.y + 4}px) translate(-100%, 0%)`,
        }}
        className='error_text_highlight'
        key={`${key}_type_target`}
      >
        {annotation.args[0].value}
      </div>
    ) : undefined,

    annotation.kind === 'type-error' && source_position ? (
      <div
        style={{
          position: 'absolute',
          transform: `translate(${source_position.x + 8}px, ${source_position.y + 4}px)`,
        }}
        className='error_text_highlight'
        key={`${key}_type_source`}
      >
        {annotation.args[1].value}
      </div>
    ) : undefined,

    annotation.kind === 'syntax-error' &&
    annotation.subkind === 'missing_parameter' ? (
      <div
        data-missing-parameter-node={node_id}
        data-missing-parameter-name={param}
        style={{
          position: 'absolute',
          transform: `translate(${target_position.x - 20}px, ${target_position.y}px) translate(-100%, -50%) translateY(-1px)`,
          zIndex: '-1',
        }}
        className='error_text_highlight'
        key={`${key}_syntax_target`}
      >
        {MISSING_PARAMETER}
      </div>
    ) : undefined,
  ]
    .filter(Boolean)
    .map((v) => v as JSX.Element);
}

export function AnnotationLayer() {
  const store = useStore();
  const { getInternalNode } = useReactFlow<TideNode>();

  // Re-render whenever React Flow commits new internal node positions, so
  // annotations are placed from the same state as the cards (and therefore
  // move with them instead of lagging a frame behind).
  useFlowStore((state) => state.nodes);

  const values = store.nodes
    .map((v) => v.data.tide_node)
    .map(
      (
        v,
      ):
        | [
            TideNodeMetadata,
            (
              | false
              | ErrorType
              | {
                  error: TideRuntimeError;
                }
            ),
          ]
        | undefined => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = extract_error(v as any);
        return error ? [v!.metadata, error] : undefined;
      },
    )
    .filter((v) => v)
    .map((v): [TideNodeMetadata, false | TideError][] => {
      // eslint-disable-next-line no-param-reassign
      v = v!;
      if (v[1] === false) return [[v[0], false]];
      return Array.isArray(v[1].error)
        ? v[1].error.map((o) => [v[0], o])
        : [[v[0], v[1].error as TideError]];
    })
    .reduce((a, b) => a.concat(b), [])
    .filter((v) => v[1] !== false)
    .map((v) => [v[0], v[1]] as [TideNodeMetadata, TideError]);

  return (
    <ViewportPortal>
      {values
        .map((v) => createAnnotationComponents(store, v, getInternalNode))
        .reduce((a, b) => a!.concat(b!), [])}
    </ViewportPortal>
  );
}
