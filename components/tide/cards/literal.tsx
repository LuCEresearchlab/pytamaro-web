import { Handle, NodeProps, Position } from '@xyflow/react';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { ExtraneousNodeProps, LiteralNode } from '.';
import {
  EvaluatedValueType,
  SoundType,
} from '../../../src/tide/language/typing';
import { useStore } from '../../../src/tide/store';
import ResultIcon from '../ResultIcon';

import { DragIndicator } from '@mui/icons-material';

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
        props.onChange(div.textContent ?? '');
      }}
      suppressContentEditableWarning={true}
    >
      {value.current}
    </div>
  );
}

export function TideLiteral({
  id,
  show_handles,
  data: { input: value, tide_node },
}: Pick<
  NodeProps<LiteralNode> & ExtraneousNodeProps,
  'id' | 'show_handles' | 'data'
>) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  const setValue = useCallback(
    (newValue: string) => {
      updateNodeData(id, 'literal', {
        input: newValue,
      } as LiteralNode['data']);
    },
    [id, updateNodeData],
  );

  const evaluated =
    tide_node && 'data' in tide_node
      ? (tide_node.data as EvaluatedValueType[SoundType])
      : undefined;
  const result = ResultIcon({ value: evaluated });

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
            width: '20px',
            display: 'flex',
            flexDirection: 'row',
            borderLeft: '2px solid #7F7F7F',
            borderTop: '2px solid #7F7F7F',
            borderBottom: '2px solid #7F7F7F',
            gap: '0px',
            position: 'relative',
          }}
        >
          <DragIndicator
            sx={{
              margin: 'none',
              position: 'absolute',
              left: '-3px',
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
                  width: '40px',
                  height: '40px',
                  transform: 'translateY(-50%) translateX(-5px)',
                  opacity: '0',
                }}
              />
            )}
          </div>
          <div className='right_white' />
        </div>

        <div className='triangle_right'></div>

        {result && (
          <div className='output_pane constant_icon_pane literal_result'>
            <div className='returns_icon'>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
