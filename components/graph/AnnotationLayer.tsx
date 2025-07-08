import { useReactFlow, ViewportPortal, XYPosition } from '@xyflow/react';
import { StoreType, useStore } from './store';
import { getHandleName } from './cards/function';
import { ErrorBubble } from './Bubble';
import { Annotation } from './annotations';
import { ErrorParagraph } from './ErrorParagraph';
import { getNode } from './utils';

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
  annotation: Annotation,
  screenToFlowPosition: (
    clientPosition: XYPosition,
    options?: {
      snapToGrid: boolean;
    },
  ) => XYPosition,
): JSX.Element[] {
  const { edges, nodes, mousePosition } = store;
  const { node_id, position, handle } = annotation.location;

  function getPosition(
    node_id: string,
    handle: string | undefined,
    position: 'target' | 'middle' | 'source' | undefined,
  ): XYPosition | undefined {
    let bubble_position: XYPosition | undefined;

    if (!handle || !position) {
      const node = getNode(nodes, node_id);

      if (!node) return { x: 0, y: 0 };

      return {
        x: node?.position.x + (node?.measured?.width || 0) / 3,
        y: node.position.y,
      };
    } else {
      const edge = edges.find(
        (v) => v.target === node_id && v.targetHandle === getHandleName(handle),
      );

      if (position === 'target' || position === 'source') {
        const nodeDiv = document.querySelector(
          `[data-id="${position === 'target' ? node_id : edge?.source}"]`,
        )! as HTMLDivElement;
        if (!nodeDiv) return undefined;

        const handleDiv = nodeDiv.querySelector(
          `[data-handleid="${position === 'target' ? getHandleName(handle) : 'output'}"]`,
        )! as HTMLDivElement;
        if (!handleDiv) return undefined;

        const rect = handleDiv.getBoundingClientRect();

        bubble_position = {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
        };

        bubble_position = screenToFlowPosition(bubble_position);
      } else {
        // position === 'middle'

        const edgeDiv = document.querySelector(
          `[data-id="${edge?.id}"]`,
        )! as HTMLDivElement;

        if (!edgeDiv) return undefined;

        const rect = edgeDiv.getBoundingClientRect();

        bubble_position = {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
        };

        bubble_position = screenToFlowPosition(bubble_position);
      }
    }

    return bubble_position;
  }

  const target_position = getPosition(node_id, handle, position);
  if (!target_position) return [];
  const source_position = getPosition(node_id, handle, 'source');

  const isNearEnough =
    Math.abs(mousePosition.x - target_position.x + 50) < 100 &&
    Math.abs(mousePosition.y - target_position.y) < 35;

  return [
    <div
      style={{
        position: 'absolute',
        transform: `translate(${target_position.x - 5}px, ${target_position.y - 5}px)`,
      }}
      key={`${node_id}_${handle}_${position}`}
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
          transform: `translate(${target_position.x - 30}px, ${target_position.y}px) translate(-100%, -100%)`,
        }}
        className='error_text_highlight'
        key={`${node_id}_${handle}_${position}_type_target`}
      >
        {annotation.args[0].value}
      </div>
    ) : undefined,

    annotation.kind === 'type-error' && source_position ? (
      <div
        style={{
          position: 'absolute',
          transform: `translate(${source_position.x + 10}px, ${source_position.y - 5}px) translate(0%, -100%)`,
        }}
        className='error_text_highlight'
        key={`${node_id}_${handle}_${position}_type_source`}
      >
        {annotation.args[1].value}
      </div>
    ) : undefined,

    annotation.kind === 'syntax-error' &&
    annotation.subkind === 'missing_parameter' ? (
      <div
        style={{
          position: 'absolute',
          transform: `translate(${target_position.x - 20}px, ${target_position.y}px) translate(-100%, -50%) translateY(-1px)`,
          zIndex: '-1',
        }}
        className='error_text_highlight'
        key={`${node_id}_${handle}_${position}_syntax_target`}
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
  const { screenToFlowPosition } = useReactFlow();

  return (
    <ViewportPortal>
      {store
        .getAnnotations()
        .map((annotation) =>
          createAnnotationComponents(store, annotation, screenToFlowPosition),
        )
        .reduce((a, b) => a!.concat(b!), [])}
    </ViewportPortal>
  );
}
