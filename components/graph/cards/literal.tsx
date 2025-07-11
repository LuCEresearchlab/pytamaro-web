/* eslint-disable no-param-reassign */
import { Handle, Node, Position } from '@xyflow/react';
import { ITamaroCardData } from '.';
import { useStore } from '../store';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { getNode, getParents } from '../utils';

import MoreVertIcon from '@mui/icons-material/MoreVert';

export const BOOL_REGEX = /(True)|(False)/;
export const FLOAT_REGEX = /^-?[0-9]+(\.[0-9]*)?$/g;
export const STR_REGEX = /^"([^\\"]|(\\")|\\\\)*"$/g;

import '../../../style/tamaro_cards.css';

export interface ITamaroLiteralCardData extends ITamaroCardData {
  literal_type?: 'float' | 'str' | 'bool';
  value: string;
}

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
  data: { value },
  hide_handles = false,
}: Node & { data: ITamaroLiteralCardData; hide_handles?: boolean }) {
  const {
    updateNodeData,
    invalidate_node,
    updateAnnotation,
    getNodes,
    getEdges,
  } = useStore();

  function guessType(v: string): 'float' | 'str' | 'bool' | undefined {
    if (v.match(BOOL_REGEX)) return 'bool';
    if (v.match(STR_REGEX)) return 'str';
    if (v.match(FLOAT_REGEX)) return 'float';
    return undefined;
  }

  const toInvalidateTimeout = useRef(undefined as NodeJS.Timeout | undefined);

  const setValue = (newValue: string) => {
    updateNodeData(id, { literal_type: guessType(newValue), value: newValue });
    const nodes = getNodes();
    const edges = getEdges();

    updateAnnotation(getNode(nodes, id)!);
    const values = Array.from(getParents(nodes, edges, id, true).values());
    values.forEach(updateAnnotation);

    if (toInvalidateTimeout.current) clearTimeout(toInvalidateTimeout.current);
    toInvalidateTimeout.current = setTimeout(() => {
      invalidate_node(id);
    }, 500);
  };

  return (
    <div className='drag-handle tamaro_card literal_card'>
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
            {!hide_handles && (
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
