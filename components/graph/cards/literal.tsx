/* eslint-disable no-param-reassign */
import { Handle, Node, Position } from '@xyflow/react';
import { ITamaroCardData } from '.';
import { useStore } from '../store';
import { CSSProperties, useRef } from 'react';
import { getNode, getParents } from '../utils';

export interface ITamaroLiteralCardData extends ITamaroCardData {
  literal_type?: 'float' | 'str' | 'bool';
  value: string;
}

export function ContentEditableDiv(props: {
  initial_value: string;
  onChange: (v: string) => void;
  style: CSSProperties;
}) {
  const value = useRef(props.initial_value);
  return (
    <div
      contentEditable
      style={props.style}
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
  data: { value, literal_type },
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
    if (v === 'True' || v === 'False') return 'bool';
    if (v.match(/^"([^\\"]|(\\")|\\\\)*"$/g)) return 'str';
    if (v.match(/^-?[0-9]+(\.[0-9]*)?$/g)) return 'float';
    return undefined;
  }

  const setValue = (newValue: string) => {
    updateNodeData(id, { literal_type: guessType(newValue), value: newValue });
    const nodes = getNodes();
    const edges = getEdges();

    updateAnnotation(getNode(nodes, id)!);
    const values = Array.from(getParents(nodes, edges, id, true).values());
    values.forEach(updateAnnotation);

    invalidate_node(id);
  };

  return (
    <div
      className='drag-handle tamaro_card'
      style={{
        display: 'flex',
        flexDirection: 'row',
        borderRadius: '5px',
      }}
    >
      <ContentEditableDiv
        initial_value={value}
        style={{
          minWidth: '50px',
          outline: 'none',
          backgroundColor: 'white',
          padding: '5px 20px',
          borderTopLeftRadius: '5px',
          borderBottomLeftRadius: '5px',
          //   width: 'fit-content',
          borderLeft: `solid ${literal_type == null ? 'red' : 'gray'} 1px`,
          borderTop: `solid ${literal_type == null ? 'red' : 'gray'} 1px`,
          borderBottom: `solid ${literal_type == null ? 'red' : 'gray'} 1px`,
        }}
        onChange={setValue}
      />
      <div
        style={{
          justifyItems: 'center',
          backgroundColor: 'white',
          padding: '5px 20px',
          borderTopRightRadius: '5px',
          borderBottomRightRadius: '5px',
          width: 'fit-content',
          border: `solid ${literal_type == null ? 'red' : 'gray'} 1px`,
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            color: literal_type == null ? 'red' : 'gray',
          }}
        >
          {literal_type == null ? 'error' : literal_type}
        </div>
      </div>

      {!hide_handles && (
        <Handle
          type='source'
          position={Position.Right}
          id='output'
          style={{
            width: '20px',
            height: '40px',
            borderRadius: '0px',
            transform: 'translateY(-50%) translateX(10px)',
            opacity: '0',
          }}
        />
      )}

      <div
        style={{
          width: '0',
          height: '0',
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderLeft: '5px solid black',

          display: 'inline-block',
          position: 'absolute',
          top: '50%',
          right: '0%',
          transform: 'translateY(-50%) translateX(100%) translateX(-2px)',
        }}
      ></div>
    </div>
  );
}
