/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @next/next/no-img-element */
import { Handle, NodeProps, Position } from '@xyflow/react';
import {
  ChangeEvent,
  CSSProperties,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useShallow } from 'zustand/shallow';
import { ConstantNode, ExtraneousNodeProps } from '.';
import { Location } from '../../../src/tide/language/types';
import {
  EvaluatedValueType,
  SoundType,
} from '../../../src/tide/language/typing';
import useLocalTranslation from '../../../src/localStorage/useLocalTranslation';
import { useStore } from '../../../src/tide/store';
import { iconPath } from '../../documentation/utils';
import ResultIcon from '../ResultIcon';

const useMutationObserver = (
  ref: RefObject<Node | null>,
  callback: () => void,
  options = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  },
) => {
  useEffect(() => {
    if (ref.current) {
      const observer = new MutationObserver(callback);
      observer.observe(ref.current, options);
      return () => observer.disconnect();
    }
  }, [callback, options, ref]);
};

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

export function TideConstantUse({
  id,
  show_handles,
  data,
}: Pick<
  NodeProps<ConstantNode> & ExtraneousNodeProps,
  'id' | 'show_handles' | 'data'
>) {
  const { t } = useLocalTranslation();
  const { updateNodeData } = useStore(
    useShallow((state) => ({
      updateNodeData: state.updateNodeData,
      judicious: state.judicious,
    })),
  );

  const i =
    data.tide_node && 'location' in data.tide_node
      ? (data.tide_node.location as Location)
      : undefined;

  const setName = useCallback(
    (newName: string) => {
      if (newName === data.input) return;
      updateNodeData(id, 'constant', { input: newName, module: undefined });
    },
    [data.input, id, updateNodeData],
  );

  const returnsIconRef: RefObject<HTMLDivElement | null> = useRef(null);

  const value =
    data.tide_node && 'data' in data.tide_node
      ? (data.tide_node.data as EvaluatedValueType[SoundType])
      : undefined;
  const returns_icon = useMemo(() => {
    return ResultIcon({ value, alt: t('resultTooltip') });
  }, [t, value]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useMutationObserver(returnsIconRef, () => {
    setDimensions({
      width: returnsIconRef.current?.clientWidth || 0,
      height: returnsIconRef.current?.clientHeight || 0,
    });
  });

  useEffect(() => {
    if (returns_icon != null) return;
    setDimensions({
      width: 0,
      height: 0,
    });
  }, [returns_icon]);

  const [editing, setEditing] = useState(false);

  return (
    <div
      className={`${editing ? '' : 'drag-handle'} compact_view hide_types hide_icons hide_output hide_optionals hide_labels`}
    >
      <div className='pane_container drag-handle'>
        <div className='pane tamaro_card constant_card constant_card_pane'>
          {i && i.module !== false && (
            <img
              className='card_library hovergroup hovergroup_marker'
              data-hovergroup={'library'}
              src={iconPath(i.module)}
              alt={t('library')}
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
                value={data.input}
                onChange={(e) => setName(e.currentTarget.value)}
                style={{
                  minWidth: '100%',
                }}
              />
            </h5>
          </div>

          <div className='triangle_right_border arrow_handles' />
          <div className='triangle_right' />
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
                {returns_icon}
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
                width: `${dimensions.width === 0 ? 20 : dimensions.width + 8}px`,
                minHeight: `20px`,
                right: `${dimensions.width === 0 ? 0 : (dimensions.width + 8) / 2}px`,
                transform: 'translateY(-50%) translateX(-5px)',
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
                width: `${dimensions.width === 0 ? 0 : dimensions.width + 8}px`,
                borderBottom: '2px solid black',
              }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}
