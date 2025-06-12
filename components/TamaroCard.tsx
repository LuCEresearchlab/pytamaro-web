import { iconPath } from '../components/documentation/utils';
import Image from 'next/image';

import '../style/tamaro_cards.css';

import { JudiciousFunction } from '../src/schemas/documentation';
import { Tooltip } from '@mui/material';
import { Handle, Position } from '@xyflow/react';

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
  handle_start,
  handle_end,
  show_handles,
}: IArrow) {
  return (
    <div className={`arrow ${optional ? 'opt_arrow' : ''}`}>
      <div className='arrow_text hovergroup_marker'>
        <h3 className='arrow_label'>{name}</h3>

        <h3 className='arrow_label_type_separator'>:</h3>

        <h3 className='arrow_type'> {type}</h3>
      </div>

      <div
        className='arrow_icon'
        style={{ flexGrow: '1', minWidth: '20px' }}
      ></div>

      {icon && (
        <Image
          className='arrow_icon'
          alt={`${name} icon`}
          src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`}
          width={32}
          height={32}
        />
      )}
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

      <div className='arrow_handles'>
        {handle_start && (
          <Handle type='target' id={handle_start} position={Position.Left} />
        )}

        {handle_end && (
          <Handle type='source' id={handle_end} position={Position.Right} />
        )}
      </div>
    </div>
  );
}

export function TamaroCard({
  el,
  module,
  show_handles,
}: {
  el: JudiciousFunction;
  module: string;
  show_handles?: boolean;
}) {
  const needed_parameters = el.parameters.filter((v) => v.default == null);
  const parameters = el.parameters;

  return (
    <div className='pane_container'>
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
                icon={``}
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
                  icon={``}
                  optional={v.default != null}
                  handle_start={`input_${v.name}`}
                  show_handles={show_handles || false}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className='pane card_pane'>
        <Image
          className='card_library hovergroup hovergroup_marker'
          data-hovergroup={'library'}
          src={iconPath(module)}
          alt='Pytamaro logo'
          width={32}
          height={32}
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
        </div>

        {el.sideEffects && (
          <Tooltip title='Calling this function causes side effects' arrow>
            <Image
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

      <div className='pane output_pane hovergroup' data-hovergroup={'output'}>
        {el.returnValue && (
          <Arrow
            parameter_amount={1}
            parameter_index={0}
            multiple={false}
            name={'output'}
            type={el.returnValue!.type}
            icon={``}
            optional={false}
            handle_end={`output`}
            show_handles={show_handles || false}
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
