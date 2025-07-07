import {
  Dimensions,
  Handle,
  NodeProps,
  Position,
  useReactFlow,
} from '@xyflow/react';
import { createRef, RefObject, useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { updateParent } from '../graph_toolbox';
import { ContentEditableDiv } from './literal';
import { ITamaroCardData } from '.';

// Can't do that with regex because of the targeting
export function check_const_name(name: string): boolean {
  function letter(v: string): boolean {
    if (v.match(/[a-zA-Z_]/)) return true;
    const code = v.charCodeAt(0);
    return 0xa1 <= code && code <= 0x10ffff;
  }

  return (
    Array.from(name).find(
      (v, i) => !(letter(v) || (i !== 0 && v.match(/[0-9]/) != null)),
    ) == null
  );
}
export const BORDER_COLOR = '#148CC8';
export const BACKGROUND_COLOR = '#E6F0FF';
const BORDER_WIDTH = '2px';

export interface ITamaroConstantDefinitionCardData extends ITamaroCardData {
  name: string;
  type?: string;

  text_width?: number;
  min_height?: number;
}

export default function ConstantDefinition({
  id,
  data,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps & { data: ITamaroConstantDefinitionCardData }) {
  const text_width = data.text_width || 0;
  const textRef: RefObject<HTMLDivElement> = createRef();
  const store = useStore();
  const { screenToFlowPosition } = useReactFlow();
  const {
    initialized,
    getNodes,
    onNodesChange,
    updateNodeData,
    invalidate_node,
  } = store;
  const thisInitialization = useRef(false);

  const name = (data.name || '') as string;

  function updateDimData() {
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();

      const { x: x0, y: y0 } = screenToFlowPosition(rect);
      const { x: x1, y: y1 } = screenToFlowPosition({
        x: rect.x + rect.width,
        y: rect.y + 150,
      });

      updateNodeData(id, (data) => ({
        ...data,
        text_width: x1 - x0,
        min_height: y1 - y0,
      }));
      onNodesChange([updateParent(store, id)]);
    }
  }

  function setName(newName: string) {
    const prev_name = name;
    updateNodeData(id, (data) => ({ ...data, name: newName }));
    updateDimData();
    getNodes()
      .filter(
        (v) =>
          v.type === 'constant_definition' &&
          [prev_name, newName].includes(v.data.name as string),
      )
      .map((v) => v.id)
      .forEach(invalidate_node);
  }

  useEffect(() => {
    if (initialized === 'done' && !thisInitialization.current) {
      updateDimData();
      thisInitialization.current = true;
      onNodesChange([updateParent(store, id)]);
    }
  }, [initialized, getNodes, store, id, onNodesChange]);

  const dimension: Dimensions = (data.dimensions || {
    width: 100,
    height: 100,
  }) as Dimensions;

  const p1 = { x: positionAbsoluteX, y: positionAbsoluteY };
  const p2 = {
    x: p1.x + (dimension.width || 0),
    y: p1.y + (dimension.height || 0),
  };
  const real_dim = {
    width: p2.x - p1.x,
    height: p2.y - p1.y,
  };

  return (
    <div
      style={{
        position: 'relative',
        width: `${real_dim.width}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '120px',
          width: 'fit-content',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '25%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '25%',
              borderStyle: 'solid',
              bottom: '100%',

              borderWidth: `30px ${text_width / 2}px 0 ${text_width / 2}px`,
              borderColor: `${BORDER_COLOR} transparent ${BORDER_COLOR} transparent`,
              transform: 'rotate(180deg)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '25%',
              borderStyle: 'solid',
              bottom: `-${BORDER_WIDTH}`,

              borderWidth: `30px ${text_width / 2}px 0 ${text_width / 2}px`,
              borderColor: `${BACKGROUND_COLOR} transparent ${BACKGROUND_COLOR} transparent`,
              transform: 'rotate(180deg)',
              pointerEvents: 'none',
            }}
          />
        </div>
        <div
          ref={textRef}
          style={{
            display: 'flex',
            flexDirection: 'row',
            color: `${BORDER_COLOR}`,
            minWidth: '400px',
            width: 'fit-content',
            height: '75%',
            borderLeft: `solid ${BORDER_COLOR} ${BORDER_WIDTH}`,
            borderRight: `solid ${BORDER_COLOR} ${BORDER_WIDTH}`,
            backgroundColor: `${BACKGROUND_COLOR}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              textWrap: 'nowrap',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'start',
              width: '100%',
              height: '100%',
              margin: 'auto 40px',
              fontSize: '40px',
            }}
          >
            <ContentEditableDiv
              value={name}
              onChange={setName}
              style={{ margin: '0px 20px', width: '100%' }}
            />{' '}
            =
          </div>
        </div>
      </div>
      <div
        className='tamaro_card'
        style={{
          borderTop: `solid ${BORDER_COLOR} 4px`,
          borderRight: `solid ${BORDER_COLOR} 4px`,
          borderBottom: `solid ${BORDER_COLOR} 4px`,
          borderLeft: `solid ${BORDER_COLOR} 4px`,
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          minWidth: '100px',
          minHeight: '100px',
          width: '100%',
          height: `${real_dim.height}px`,
          aspectRatio: '2',
          position: 'relative',
        }}
      >
        <div
          style={{
            backgroundColor: `${BACKGROUND_COLOR}`,
            opacity: '0.2',
            width: '100%',
            height: '100%',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '40px',
            transform: 'translateY(-50%) translateX(100%)',
            paddingLeft: '16px',
            width: '16px',
            height: '64px',
            borderRadius: '0px',
            zIndex: '900',
            borderLeft: `solid ${BORDER_COLOR} 32px`,
            borderTop: 'solid transparent 32px',
            borderBottom: 'solid transparent 32px',
            borderRight: 'solid transparent 32px',
            backgroundColor: 'transparent',
          }}
        >
          <Handle
            position={Position.Right}
            type='target'
            style={{
              right: '0',
              transform: 'translateX(-100%) translateX(-32px)',
              opacity: '0',
            }}
            id={'output'}
          />
        </div>
      </div>
    </div>
  );
}
