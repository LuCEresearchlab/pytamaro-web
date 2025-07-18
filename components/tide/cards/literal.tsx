import { Handle, NodeProps, Position } from '@xyflow/react';
import { ExtraneousNodeProps, LiteralNode } from '.';
import { useStore } from '../../../src/tide/store';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import MoreVertIcon from '@mui/icons-material/MoreVert';

export const BOOL_REGEX = /(True)|(False)/;
export const FLOAT_REGEX = /^-?[0-9]+(\.[0-9]*)?$/g;
export const STR_REGEX = /^"([^\\"]|(\\")|\\\\)*"$/g;

import '../../../style/tamaro_cards.css';

// eslint-disable-next-line react/require-default-props
export function ContentEditableDiv(props: {
  value: string;
  onChange: (v: string) => void;
  resetOnChange?: boolean;
  style?: CSSProperties;
}) {
  const value = useRef(props.value);

  const [bool, setBool] = useState(false);

  useEffect(() => {
    if (props.resetOnChange === true) {
      value.current = props.value;
      setBool(!bool);
    }
  }, [bool, props.resetOnChange, props.value]);

  return (
    <div
      contentEditable
      style={{
        outline: 'none',
        whiteSpace: 'pre',
        ...props.style,
      }}
      spellCheck={false}
      autoCorrect='off'
      autoCapitalize='false'
      onInput={(e) => {
        const div = e.target as HTMLElement;
        props.onChange(div.textContent || '');
      }}
      suppressContentEditableWarning={true}
    >
      {value.current}
    </div>
  );
}

export function TamaroLiteralCard({
  id,
  show_handles,
  data: { str_value: value },
}: NodeProps<LiteralNode> & ExtraneousNodeProps) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  const setValue = useCallback(
    (newValue: string) => {
      updateNodeData(id, {
        evaluated: false,
        kind: 'literal',
        metadata: {
          node_id: id,
        },
        str_value: newValue,
      } as LiteralNode['data']);
    },
    [id, updateNodeData],
  );

  return (
    <div className='tamaro_card literal_card'>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '5px',
          position: 'relative',
          width: 'fit-content',
        }}
      >
        <div
          className='drag-handle'
          style={{
            borderTopLeftRadius: '5px',
            borderBottomLeftRadius: '5px',
            backgroundColor: '#DEDEDE',
            width: '30px',
            display: 'flex',
            flexDirection: 'row',
            borderLeft: '2px solid #7F7F7F',
            borderTop: '2px solid #7F7F7F',
            borderBottom: '2px solid #7F7F7F',
            gap: '0px',
            position: 'relative',
          }}
        >
          <MoreVertIcon
            sx={{
              margin: 'none',
              position: 'absolute',
              left: '0px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#969696',
            }}
          />
          <MoreVertIcon
            sx={{
              margin: 'none',
              position: 'absolute',
              left: '5px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#969696',
            }}
          />
        </div>
        <ContentEditableDiv
          value={value}
          style={{
            minWidth: '85px',
            backgroundColor: 'white',
            padding: '5px 20px',
            borderTopRightRadius: '5px',
            borderBottomRightRadius: '5px',
            borderLeft: 'solid #7F7F7F 2px',

            borderRight: '2px solid #7F7F7F',
            borderTop: '2px solid #7F7F7F',
            borderBottom: '2px solid #7F7F7F',
          }}
          onChange={setValue}
        />

        <div className='triangle_right_border arrow_handles'>
          <div className='right'>
            {show_handles === true && (
              <Handle
                type='source'
                position={Position.Right}
                id={'output'}
                className='handle'
                style={{
                  width: '20px',
                  height: '20px',
                  opacity: '0',
                }}
              />
            )}
          </div>
          <div className='right_white' />
        </div>

        <div className='triangle_right'></div>
      </div>
    </div>
  );
}
