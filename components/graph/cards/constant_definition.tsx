import { Dimensions, Handle, NodeProps, Position } from '@xyflow/react';
import { createRef, RefObject, useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { updateParent } from '../graph_toolbox';

const BORDER_COLOR = '#148CC8';
const BACKGROUND_COLOR = '#E6F0FF';
const BORDER_WIDTH = '2px';

export default function ConstantDefinition({
  id,
  data,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps) {
  const textRef: RefObject<HTMLDivElement> = createRef();
  const store = useStore();
  const [textWidth, setTextWidth] = useState(0);
  const { initialized, getNodes, onNodesChange } = store;
  const thisInitialization = useRef(false);
  const name = 'abcdefghijklmnopqrstaaaaaaaaaaaaaaaaaaaaaa';

  useEffect(() => {
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setTextWidth(rect.width);
    }
  }, [name]);

  useEffect(() => {
    if (initialized === 'done' && !thisInitialization.current) {
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

              borderWidth: `30px ${textWidth / 2}px 0 ${textWidth / 2}px`,
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

              borderWidth: `30px ${textWidth / 2}px 0 ${textWidth / 2}px`,
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
            = {name}
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
          />
        </div>
      </div>
    </div>
  );
}
