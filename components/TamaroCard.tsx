import { iconPath } from '../components/documentation/utils';
import N_Image from 'next/image';

import '../style/tamaro_cards.css';

import {
  JudiciousConstant,
  JudiciousElement,
  JudiciousFunction,
} from '../src/schemas/documentation';
import { Tooltip } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import { executeOnServer } from '../src/useActivity';
import { useEffect, useState } from 'react';
import { isEmpty, negate } from 'lodash';

interface IArrow {
  parameter_index: number;
  parameter_amount: number;
  name: string;
  type: string;
  icon: string;
  multiple: boolean;
  optional: boolean;

  handle_start?: string;
  handle_end?: string;
  show_handles: boolean;
}

export function Arrow({
  name,
  type,
  icon,
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
        {icon && (
          <div>
            <img
              className='arrow_icon'
              alt={`${name} icon`}
              src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`}
            />
          </div>
        )}
      </div>

      {Array.from({ length: multiple ? 3 : 1 }).map((_, i) => {
        return (
          <div
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
  returns_expression = undefined,
}: {
  el: JudiciousFunction;
  module: string;
  show_handles?: boolean;
  returns_expression?: string;
}) {
  const needed_parameters = el.parameters.filter((v) => v.default == null);
  const parameters = el.parameters;

  const show_display = el.returnValue && returns_expression != null;
  const [imgData, setImgData] = useState(undefined as string | undefined);
  const [dimension, setDimension] = useState(
    undefined as { width: number; height: number } | undefined,
  );

  const IMG_SCALE = 0.2;

  useEffect(() => {
    if (returns_expression)
      executeOnServer([returns_expression], 0, [], [])
        .catch(() => undefined)
        .then((v) => (v?.type === 'success' ? v.stdout : undefined))
        .then((data) => {
          if (!data) return undefined;
          const pytamaroDataUriRegex =
            /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
          return data.split(pytamaroDataUriRegex).filter(negate(isEmpty))[0];
        })
        .then(async (data) => {
          if (!data) return undefined;
          return await new Promise<string>(function (resolved, rejected) {
            let i = new Image();
            i.onload = function () {
              setDimension({
                width: i.naturalWidth * IMG_SCALE,
                height: i.naturalHeight * IMG_SCALE,
              });
              resolved(data);
            };
            i.src = data;
          });
        })
        .then(setImgData);
  }, [returns_expression]);

  return (
    <div className='pane_container function_card_pane'>
      <div className='pane req_parameter_pane parameter_pane'>
        {needed_parameters.map((v, i) => {
          return (
            <div
              className='hovergroup'
              data-hovergroup={`input_${v.name}`}
              key={i}
            >
              <Arrow
                key={i}
                parameter_index={i}
                parameter_amount={needed_parameters.length}
                name={v.name}
                type={v.type}
                optional={false}
                multiple={v.variableLength == null ? false : v.variableLength}
                icon={v.icon || ''}
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
                key={i}
              >
                <Arrow
                  parameter_index={i}
                  parameter_amount={parameters.length}
                  name={v.name}
                  type={v.type}
                  multiple={v.variableLength == null ? false : v.variableLength}
                  icon={v.icon || ''}
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

          {el.icon && (
            <img
              className='card_icon'
              src={`data:image/svg+xml;utf8,${encodeURIComponent(el.icon)}`}
            />
          )}
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
        style={
          dimension
            ? {
                width: `${dimension.width + 24}px`,
              }
            : undefined
        }
        className='pane output_pane hovergroup'
        data-hovergroup={'output'}
      >
        {show_display && el.returnValue && imgData && dimension && (
          <img
            style={{
              width: `${dimension.width}px`,
              height: `${dimension.height}px`,
            }}
            className='img'
            alt='Expression Result'
            src={imgData}
          />
        )}
        {el.returnValue && (
          <Arrow
            parameter_amount={1}
            parameter_index={0}
            multiple={false}
            name={'->'}
            type={el.returnValue!.type}
            icon={el.returnValue.icon || ''}
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
}: {
  el: JudiciousConstant;
  module: string;
  show_handles?: boolean;
}) {
  return (
    <div className='pane_container tamaro_card constant_card drag-handle'>
      <div className='pane constant_card_pane'>
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

        <div className='triangle_right arrow_handles'>
          {show_handles && (
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
      <div className='constant_icon_pane'>
        {el.icon && (
          <img
            className='constant_card_icon card_icon'
            src={`data:image/svg+xml;utf8,${encodeURIComponent(el.icon)}`}
          />
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
