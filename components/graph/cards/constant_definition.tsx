import {
  Dimensions,
  Handle,
  NodeProps,
  Position,
  useReactFlow,
} from '@xyflow/react';
import { createRef, RefObject, useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { updateParent } from '../graph_toolbox';
import { ContentEditableDiv } from './literal';
import { CommonNodeData, ConstantDefinitionNode, ITamaroCardData } from '.';

const KEYWORDS: string[] = [
  'False',
  'await',
  'else',
  'import',
  'pass',
  'None',
  'break',
  'except',
  'in',
  'raise',
  'True',
  'class',
  'finally',
  'is',
  'return',
  'and',
  'continue',
  'for',
  'lambda',
  'try',
  'as',
  'def',
  'from',
  'nonlocal',
  'while',
  'assert',
  'del',
  'global',
  'not',
  'with',
  'async',
  'elif',
  'if',
  'or',
  'yield',
];

// Can't do that with regex because of the targeting
export function check_const_name(
  reserved_name: string[],
  name: string,
): boolean {
  function letter(v: string): boolean {
    if (v.match(/[a-zA-Z_]/)) return true;
    const code = v.charCodeAt(0);
    return 0xa1 <= code && code <= 0x10ffff;
  }

  return (
    Array.from(name).find(
      (v, i) => !(letter(v) || (i !== 0 && v.match(/[0-9]/) != null)),
    ) == null &&
    !KEYWORDS.includes(name) &&
    !reserved_name.includes(name)
  );
}
export const BORDER_COLOR = '#148CC8';
export const BACKGROUND_COLOR = '#d1f0ff';
const BORDER_WIDTH = '2px';

export interface ITamaroConstantDefinitionCardData extends ITamaroCardData {
  name: string;
  type?: string;

  text_width?: number;
  min_height?: number;
}

export default function ConstantDefinition(
  props: NodeProps<ConstantDefinitionNode> & CommonNodeData,
) {
  const { id, positionAbsoluteX, positionAbsoluteY, data, show_handles } =
    props;
  const text_width = data.text_width || 0;
  const textRef: RefObject<HTMLDivElement> = createRef();
  const store = useStore();
  const { screenToFlowPosition } = useReactFlow();
  const { initialized, onNodesChange, updateNodeData } = store;
  const thisInitialization = useRef(false);

  const name = (data.import.name || '') as string;

  const updateDimData = useCallback(() => {
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();

      const { x: x0, y: y0 } = screenToFlowPosition(rect);
      const { x: x1, y: y1 } = screenToFlowPosition({
        x: rect.x + rect.width,
        y: rect.y,
      });

      updateNodeData(id, (data) => ({
        ...data,
        text_width: x1 - x0,
        min_height: y1 - y0,
      }));
      onNodesChange([updateParent(store, id)]);
    }
  }, [id, onNodesChange, screenToFlowPosition, store, textRef, updateNodeData]);

  function setName(newName: string) {
    updateNodeData(id, (data) => ({ ...data, name: newName }));
    updateDimData();
  }

  useEffect(() => {
    if (initialized === 'done' && !thisInitialization.current) {
      updateDimData();
      thisInitialization.current = true;
      onNodesChange([updateParent(store, id)]);
    }
  }, [initialized, store, id, onNodesChange, updateDimData]);

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
      className='tamaro_card'
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
          height: '40px',
          width: 'fit-content',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '25%',
            zIndex: '-1',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '25%',
              borderStyle: 'solid',
              bottom: '0%',

              borderWidth: `15px ${text_width / 2}px 0 ${text_width / 2}px`,
              borderColor: `${BORDER_COLOR} transparent ${BORDER_COLOR} transparent`,
              transform: 'rotate(180deg)',
              pointerEvents: 'none',
              position: 'absolute',
            }}
          />

          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '25%',
              borderStyle: 'solid',
              bottom: `-${BORDER_WIDTH}`,

              borderWidth: `15px ${text_width / 2}px 0 ${text_width / 2}px`,
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
            minWidth: '200px',
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
              fontSize: '20px',
              fontWeight: 'bold',
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
        style={{
          borderTop: `solid ${BORDER_COLOR} 4px`,
          borderRight: `solid ${BORDER_COLOR} 4px`,
          borderBottom: `solid ${BORDER_COLOR} 4px`,
          borderLeft: `solid ${BORDER_COLOR} 4px`,
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          backgroundColor: 'white',
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
            right: '15px',
            transform: 'translateY(-50%) translateX(100%)',
            height: '25px',
            aspectRatio: '1',
            zIndex: '900',
            borderTopLeftRadius: '50%',
            borderBottomLeftRadius: '50%',
            borderLeft: `solid ${BORDER_COLOR} 16px`,
            backgroundColor: 'transparent',
          }}
        >
          {show_handles === true && (
            <Handle
              position={Position.Left}
              type='target'
              style={{
                left: 'unset',
                transform: 'translateY(-50%) translateX(-65%)',
                height: '25px',
                width: '25px',
                opacity: '0',
              }}
              id={'output'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
