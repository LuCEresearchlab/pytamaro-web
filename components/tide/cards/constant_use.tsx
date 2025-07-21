/* eslint-disable @next/next/no-img-element */
import { Handle, NodeProps, Position } from '@xyflow/react';
import { ExtraneousNodeProps, ConstantNode } from '.';
import { useStore } from '../../../src/tide/store';
import {
  ChangeEvent,
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { Location } from '../../../src/tide/language/types';
import ResultIcon from '../ResultIcon';
import { iconPath } from '../../documentation/utils';

export function AutoWidthInput({
  value,
  onChange,
  placeholder = '',
  className = '',
  style = {},
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const spanRef = useRef(null);
  const inputRef = useRef(null);
  const [inputWidth, setInputWidth] = useState(20);

  useEffect(() => {
    if (spanRef.current) {
      const newWidth = (spanRef.current as HTMLElement).offsetWidth + 2; // small padding
      setInputWidth(newWidth < 20 ? 20 : newWidth);
    }
  }, [value, placeholder]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <input
        ref={inputRef}
        type='text'
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: `${inputWidth}px`,
          minWidth: '20px',
          maxWidth: '100%',
          boxSizing: 'content-box',
          border: 'none',
          backgroundColor: 'transparent',
          outline: 'none',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1em',
          fontFamily: "'Fira Sans',sans-serif",
          ...style,
        }}
        className={className}
        autoCorrect='false'
        autoComplete='false'
        spellCheck='false'
      />

      <span
        ref={spanRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          whiteSpace: 'pre',
          font: 'inherit',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1em',
          fontFamily: "'Fira Sans',sans-serif",
          padding: 0,
          margin: 0,
        }}
        autoCorrect='false'
        spellCheck='false'
      >
        {value || placeholder}
      </span>
    </div>
  );
}

export default function ConstantUse(
  props: NodeProps<ConstantNode> & ExtraneousNodeProps,
) {
  const { id, show_handles, data } = props;
  const i = data.location;
  const updateNodeData = useStore((state) => state.updateNodeData);
  const context = useStore((state) => state.evaluated_context);

  const setName = useCallback(
    (newName: string) => {
      if (newName === i.name) return;
      updateNodeData(id, (data) => ({
        ...data,
        location: {
          module:
            context().find((v) => v.location.name === newName)?.location
              .module || false,
          name: newName,
        } as Location,
      }));
    },
    [context, i.name, id, updateNodeData],
  );

  const returnsIconRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [editing, setEditing] = useState(false);

  const value = data.evaluated ? data.value : undefined;
  const returns_icon = useMemo(() => {
    return ResultIcon({ value });
  }, [value]);

  useEffect(() => {
    if (!returnsIconRef.current) return;

    const newDim = {
      width: returnsIconRef.current.clientWidth,
      height: returnsIconRef.current.clientHeight,
    };

    if (
      newDim.width === dimensions.width &&
      newDim.height === dimensions.height
    )
      return;

    setDimensions(newDim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returns_icon]);

  return (
    <div
      className={`${editing ? '' : 'drag-handle'} compact_view hide_types hide_icons hide_output hide_optionals hide_labels`}
    >
      <div className='pane_container drag-handle'>
        <div className='pane tamaro_card constant_card constant_card_pane'>
          {i.module !== false && (
            <img
              className='card_library hovergroup hovergroup_marker'
              data-hovergroup={'library'}
              src={iconPath(i.module)}
              alt='Library icon'
            />
          )}

          <div
            style={{
              alignSelf: 'center',
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h5
              className='card_name hovergroup hovergroup_marker'
              data-hovergroup={'constant'}
              style={{
                minWidth: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
            >
              <AutoWidthInput
                value={i.name}
                onChange={(e) => setName(e.currentTarget.value)}
                style={{
                  minWidth: '100%',
                }}
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
            position: 'relative',
          }}
        >
          <div
            className='output_pane constant_icon_pane'
            style={{
              position: returns_icon ? 'absolute' : undefined,
              minWidth: '0px',
              left: '0',
              bottom: '50%',
              transform: 'translate(5px, -10px)',
            }}
          >
            {returns_icon && (
              <div ref={returnsIconRef} className='returns_icon'>
                {returns_icon && (returns_icon as ReactElement)}
              </div>
            )}
          </div>

          {show_handles && (
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
