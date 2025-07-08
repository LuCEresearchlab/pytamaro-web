import { Handle, NodeProps, Position } from '@xyflow/react';
import { ITamaroCardData } from '.';
import { ContentEditableDiv } from './literal';
import { useStore } from '../store';

export interface ITamaroConstantUseCardData extends ITamaroCardData {
  name: string;
}

export default function ConstantUse({
  id,
  data,
  hide_handles,
  resetOnChange = false,
}: NodeProps & { hide_handles: boolean; resetOnChange?: boolean }) {
  const { updateNodeData, invalidate_node } = useStore();
  const { name } = data as unknown as ITamaroConstantUseCardData;

  function setName(v: string) {
    updateNodeData(id, (data) => ({ ...data, name: v }));
    invalidate_node(id);
  }

  return (
    <div className='pane_container tamaro_card constant_card drag-handle'>
      <div className='pane constant_card_pane'>
        <div
          style={{
            alignSelf: 'center',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <h5
            className='card_name hovergroup hovergroup_marker'
            data-hovergroup={'constant'}
            style={{
              width: '100%',
              height: '100%',
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

        <div className='triangle_right arrow_handles'>
          {!hide_handles && (
            <div className='handle_mover right'>
              <Handle
                type='source'
                position={Position.Right}
                id={'output'}
                className='handle'
              />
            </div>
          )}
        </div>
        <div className='triangle_right_fill'></div>
      </div>
    </div>
  );
}
