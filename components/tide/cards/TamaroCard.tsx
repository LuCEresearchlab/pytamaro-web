/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @next/next/no-img-element */
import N_Image from 'next/image';
import { iconPath } from '../../documentation/utils';

import { Tooltip } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import { ReactElement, useEffect, useRef, useState } from 'react';
import {
  JudiciousConstant,
  JudiciousElement,
  JudiciousFunction,
} from '../../../src/schemas/documentation';

interface IArrow {
  parameter_index: number;
  parameter_amount: number;
  name: string;
  type: string;
  //icon: string;
  multiple: boolean;
  optional: boolean;

  handle_start?: string;
  handle_end?: string;
  show_handles: boolean;
}

// const useMutationObserver = (
//   ref: RefObject<Node>,
//   callback: () => void,
//   options = {
//     attributes: true,
//     characterData: true,
//     childList: true,
//     subtree: true,
//   },
// ) => {
//   useEffect(() => {
//     if (ref.current) {
//       const observer = new MutationObserver(callback);
//       observer.observe(ref.current, options);
//       return () => observer.disconnect();
//     }
//   }, [callback, options, ref]);
// };

export function Arrow({
  name,
  type,
  // icon,
  multiple,
  optional,
  handle_start = undefined,
  handle_end = undefined,
  show_handles,
}: IArrow) {
  return (
    <div className={`arrow ${optional ? 'opt_arrow' : ''}`}>
      <div className='arrow_text hovergroup_marker'>
        <h3 className='arrow_label'>{name}</h3>

        <h3 className='arrow_label_type_separator'>:</h3>

        <h3 className='arrow_type'> {type}</h3>

        <div style={{ flexGrow: '1', minWidth: '10px' }} />
        {/*icon && (
          <div>
            <img
              className='arrow_icon'
              alt={`${name} icon`}
              src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`}
            />
          </div>
        )*/}
      </div>

      {Array.from({ length: multiple ? 3 : 1 }).map((_, i) => {
        return (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className='triangle_right'
            style={{
              right: `${7.5 * i - 2}px`,
            }}
          />
        );
      })}

      {show_handles && (
        <div className='arrow_handles'>
          {handle_start && (
            <div className='handle_mover left'>
              <Handle
                type='target'
                id={handle_start}
                position={Position.Left}
                className='handle'
              />
            </div>
          )}

          {handle_end && (
            <div className='handle_mover right'>
              <Handle
                type='source'
                id={handle_end}
                position={Position.Right}
                className='handle'
                style={{}}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TamaroCard({
  el,
  module,
  show_handles = false,
}: {
  el: JudiciousElement;
  module: string;
  show_handles?: boolean;
}) {
  switch (el.kind) {
    case 'function':
      return FunctionTamaroCard({ el, module, show_handles });
    case 'constant':
      return ConstantTamaroCard({
        el: el as JudiciousConstant,
        module,
        show_handles,
      });
  }
  return <div>Invalid Kind</div>;
}

export function FunctionTamaroCard({
  el,
  module,
  show_handles = false,
  returns_icon = undefined,
}: {
  el: JudiciousFunction;
  module: string;
  show_handles?: boolean;
  returns_icon?: ReactElement;
}) {
  const needed_parameters = el.parameters.filter((v) => v.default == null);
  const parameters = el.parameters;

  const returnsIconRef = useRef(
    null,
  ) as React.MutableRefObject<HTMLDivElement | null>;

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // useMutationObserver(returnsIconRef, () => {
  //   setDimensions({
  //     width: returnsIconRef.current.clientWidth,
  //     height: returnsIconRef.current.clientHeight,
  //   });
  // });

  useEffect(() => {
    if (returns_icon != null) return;
    setDimensions({
      width: 0,
      height: 0,
    });
  }, [returns_icon]);

  return (
    <div className='pane_container function_card_pane'>
      <div className='pane req_parameter_pane parameter_pane'>
        {needed_parameters.map((v, i) => {
          return (
            <div
              className='hovergroup'
              data-hovergroup={`input_${v.name}`}
              // eslint-disable-next-line react/no-array-index-key
              key={i}
            >
              <Arrow
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                parameter_index={i}
                parameter_amount={needed_parameters.length}
                name={v.name}
                type={v.type}
                optional={false}
                multiple={v.variableLength == null ? false : v.variableLength}
                // icon={v.icon || ''}
                handle_start={`input_${v.name}`}
                show_handles={show_handles || false}
              />
            </div>
          );
        })}
      </div>

      {!show_handles && (
        <div className='pane opt_parameter_pane parameter_pane'>
          {parameters.map((v, i) => {
            return (
              <div
                className='hovergroup'
                data-hovergroup={`input_${v.name}`}
                // eslint-disable-next-line react/no-array-index-key
                key={i}
              >
                <Arrow
                  parameter_index={i}
                  parameter_amount={parameters.length}
                  name={v.name}
                  type={v.type}
                  multiple={v.variableLength == null ? false : v.variableLength}
                  // icon={v.icon || ''}
                  optional={v.default != null}
                  handle_start={`input_${v.name}`}
                  show_handles={show_handles || false}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className='pane tamaro_card function_card'>
        <img
          className='card_library hovergroup hovergroup_marker'
          data-hovergroup={'library'}
          src={iconPath(module)}
          alt='Library Icon'
        />

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
            data-hovergroup={'function'}
          >
            {el.name}
          </h5>

          {/*el.icon && (
            <img
              alt=''
              className='card_icon'
              src={`data:image/svg+xml;utf8,${encodeURIComponent(el.icon)}`}
            />
          )*/}
        </div>

        {el.sideEffects && (
          <Tooltip title='Calling this function causes side effects' arrow>
            <N_Image
              style={{
                position: 'absolute',
                top: '5%',
                right: '5%',
              }}
              src={'/boom.png'}
              alt='side effect icon'
              width='36'
              height='36'
            />
          </Tooltip>
        )}
      </div>

      <div
        className='pane output_pane hovergroup'
        data-hovergroup={'output'}
        style={
          returnsIconRef
            ? {
                minWidth: `${dimensions.width + 24}px`,
              }
            : undefined
        }
      >
        {returns_icon && (
          <div ref={returnsIconRef} className='returns_icon'>
            {returns_icon && (returns_icon as ReactElement)}
          </div>
        )}
        {el.returnValue && (
          <Arrow
            parameter_amount={1}
            parameter_index={0}
            multiple={false}
            name={'->'}
            type={el.returnValue!.type}
            // icon={el.returnValue.icon || ''}
            optional={false}
            handle_end={`output`}
            show_handles={show_handles || false}
          />
        )}
      </div>
    </div>
  );
}

export function ConstantTamaroCard({
  el,
  module,
  show_handles = false,
  returns_icon = undefined,
}: {
  el: JudiciousConstant;
  module: string;
  show_handles?: boolean;
  returns_icon?: ReactElement;
}) {
  //const returnsIconRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // useMutationObserver(returnsIconRef, () => {
  //   setDimensions({
  //     width: returnsIconRef.current.clientWidth,
  //     height: returnsIconRef.current.clientHeight,
  //   });
  // });

  useEffect(() => {
    if (returns_icon != null) return;
    setDimensions({
      width: 0,
      height: 0,
    });
  }, [returns_icon]);

  return (
    <div className='pane_container drag-handle' style={{ display: 'flex' }}>
      <div className='pane tamaro_card constant_card constant_card_pane'>
        <img
          className='card_library hovergroup hovergroup_marker'
          data-hovergroup={'library'}
          src={iconPath(module)}
          alt='Library icon'
        />

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
          >
            {el.name}
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
        }}
      >
        <div
          className='output_pane constant_icon_pane'
          style={{
            position: returns_icon ? 'absolute' : undefined,
            minWidth: '0px',
          }}
        >
          {/*returns_icon && (
            <div ref={returnsIconRef} className='returns_icon'>
              {returns_icon && (returns_icon as ReactElement)}
            </div>
          )*/}

          {/*el.icon && (
            <img
              alt=''
              className='constant_card_icon card_icon'
              src={`data:image/svg+xml;utf8,${encodeURIComponent(el.icon)}`}
            />
          )*/}
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
              width: `${dimensions.width === 0 ? 0 : dimensions.width + 8}px`,
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
  );
}

export function ProceduralHoverStyles({
  root = 'html',
  groups,
}: {
  root?: string;
  groups: string[];
}) {
  return (
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: groups
          .map(
            (v) =>
              `
${root}:has(.hovergroup[data-hovergroup="${v}"]:hover) .hovergroup[data-hovergroup="${v}"] .hovergroup_marker {
    background-color: var(--hover-color);
}
${root}:has(.hovergroup[data-hovergroup="${v}"]:hover) .hovergroup[data-hovergroup="${v}"].hovergroup_marker {
    background-color: var(--hover-color);
}
`,
          )
          .join('\n'),
      }}
    />
  );
}
