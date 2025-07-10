import { Handle, NodeProps, Position } from '@xyflow/react';
import { ITamaroCardData } from '.';
import { ContentEditableDiv } from './literal';
import { useStore } from '../store';
import { useEffect, useRef, useState } from 'react';
import ResultIcon from '../ResultIcon';
import { ReactElement } from 'react-markdown/lib/react-markdown';

export interface ITamaroConstantUseCardData extends ITamaroCardData {
  name: string;
}

export default function ConstantUse(
  props: NodeProps & {
    data: ITamaroConstantUseCardData;
    hide_handles: boolean;
    resetOnChange?: boolean;
  },
) {
  const { id, data, hide_handles, resetOnChange = false } = props;
  const { updateNodeData, invalidate_node } = useStore();
  const { name } = data as unknown as ITamaroConstantUseCardData;

  function setName(v: string) {
    updateNodeData(id, (data) => ({ ...data, name: v }));
    invalidate_node(id);
  }

  const returns_icon = <ResultIcon node_props={props} />;

  const returnsIconRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!returnsIconRef.current) return;

    setDimensions({
      width: returnsIconRef.current.clientWidth,
      height: returnsIconRef.current.clientHeight,
    });
  }, [returns_icon]);

  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      <div className='pane_container drag-handle'>
        <div className='pane tamaro_card constant_card constant_card_pane'>
          <div
            style={{
              alignSelf: 'center',
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: '100%',
            }}
          >
            <h5
              className='card_name hovergroup hovergroup_marker'
              data-hovergroup={'constant'}
              style={{
                minWidth: '100%',
              }}
            >
              <ContentEditableDiv
                style={{
                  minWidth: '100%',
                }}
                value={name}
                resetOnChange={resetOnChange}
                onChange={setName}
              />
            </h5>
          </div>

          <div className='triangle_right arrow_handles' />
          <div className='triangle_right_fill' />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
          }}
        >
          <div
            className='output_pane constant_icon_pane'
            style={{
              position: returns_icon ? 'absolute' : undefined,
              minWidth: '0px',
            }}
          >
            {returns_icon && (
              <div ref={returnsIconRef} className='returns_icon'>
                {returns_icon && (returns_icon as ReactElement)}
              </div>
            )}
          </div>

          {!props.hide_handles && (
            <Handle
              type='source'
              position={Position.Right}
              id={'output'}
              className='handle'
              style={{
                position: 'absolute',
                borderRadius: '0px',
                minWidth: `${dimensions.width === 0 ? 0 : dimensions.width + 8}px`,
                right: `${dimensions.width === 0 ? 0 : (dimensions.width + 8) / 2}px`,
                opacity: '0',
              }}
            />
          )}
          {returns_icon && (
            <div
              style={{
                position: 'relative',
                zIndex: '-1000',
                left: '-5px',
                top: '0px',
                margin: 'auto',
                minWidth: `${dimensions.width === 0 ? 0 : dimensions.width + 8}px`,
                borderBottom: '2px solid black',
              }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}
