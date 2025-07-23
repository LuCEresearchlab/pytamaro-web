import { Card, CardActions, CardContent, Input } from '@mui/material';
import { useStore } from '../../src/tide/store';
import { DragEvent, useEffect, useState } from 'react';
import { FLOAT_REGEX, STR_REGEX, TideLiteral } from './cards/literal';
import { check_const_name } from './cards/constant_definition';
import {
  FunctionNode,
  ConstantNode,
  TideNodeMetadata,
  TamaroCardNode,
  LiteralNode,
} from './cards';
import {
  LiteralType,
  SoundType,
  UnsoundType,
} from '../../src/tide/language/typing';
import { TideSyntaxErrorInvalidLiteral_builder } from '../../src/tide/language/error_builders';
import { INT_REGEX } from '../../src/tide/language/utils';
import { Definitions } from '../../src/tide/language/definitions';
import { TideFunctionuse } from './cards/function';
import { TideConstantUse } from './cards/constant_use';

interface CardSelectionPaneProps {
  values: Definitions<TideNodeMetadata>;
}

export function TidePalettePane({ values }: CardSelectionPaneProps) {
  const { setDragged, reserved_names } = useStore();

  const [filter, setFilter] = useState('');
  const [constant_name, setConstantName] = useState('' as string | undefined);

  const [literals, setLiterals] = useState(
    [] as { regex: RegExp; value: string; type: LiteralType }[],
  );

  useEffect(() => {
    setLiterals(
      (
        [
          { regex: /$^/, value: 'False', type: SoundType.Bool },
          { regex: /$^/, value: 'True', type: SoundType.Bool },
          { regex: FLOAT_REGEX, value: '200.0', type: SoundType.Float },
          { regex: INT_REGEX, value: '200', type: SoundType.Int },
          { regex: STR_REGEX, value: '"Abc"', type: SoundType.Str },
        ] as { regex: RegExp; value: string; type: LiteralType }[]
      )
        .filter(
          (v) =>
            filter === '' ||
            filter.match(v.regex) ||
            v.value.startsWith(filter),
        )
        .map((v) => ({
          ...v,
          value: filter === '' || !filter.match(v.regex) ? v.value : filter,
        })),
    );

    if (filter === '' || check_const_name(reserved_names, filter))
      setConstantName(filter);
    else setConstantName(undefined);
  }, [filter, reserved_names, setLiterals]);

  const onDragStart = function (
    event: DragEvent<HTMLDivElement>,
    data: TamaroCardNode['data'],
  ) {
    setDragged(data);
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer!.effectAllowed = 'move';
  };

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent
        className='selection_pane_content'
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '5px',
          overflow: 'scroll',
        }}
      >
        {values
          .filter(
            (el) =>
              el.kind === 'function_definition' ||
              el.kind === 'constant_definition',
          )
          .filter((v) => v.location.name.toLowerCase().startsWith(filter))
          .map((el): FunctionNode['data'] | ConstantNode['data'] => {
            switch (el.kind) {
              case 'function_definition': {
                return {
                  children: new Map(),
                  evaluated: false,
                  location: el.location,
                  kind: 'function_use',
                  metadata: {
                    node_id: '',
                  },
                } as FunctionNode['data'];
                break;
              }
              case 'constant_definition': {
                return {
                  kind: 'constant_use',
                  evaluated: false,
                  location: el.location,
                  metadata: {
                    node_id: '',
                  },
                } as ConstantNode['data'];
                break;
              }
            }
          })
          .map((el) => (
            <div
              className='compact_view hide_types hide_labels hide_handles hide_optionals'
              style={{ userSelect: 'none' }}
              onDragStart={(e) => onDragStart(e, el)}
              draggable
              key={el.location.module + '$' + el.location.name}
            >
              <div style={{ pointerEvents: 'none' }}>
                {el.kind === 'function_use' ? (
                  <TideFunctionuse data={el} show_handles={false} id='' />
                ) : (
                  <TideConstantUse data={el} show_handles={false} id='' />
                )}
              </div>
            </div>
          ))}
        {literals
          .map(({ value, type }): LiteralNode['data'] => {
            return {
              evaluated: true,
              kind: 'literal',
              metadata: {
                node_id: '',
              },
              str_value: value,
              value:
                type === UnsoundType.Bottom
                  ? {
                      type: UnsoundType.Bottom,
                      error: TideSyntaxErrorInvalidLiteral_builder(value),
                    }
                  : {
                      type: type,
                      data: undefined,
                      value: {
                        expression: value,
                        imports: [],
                      },
                    },
            };
          })
          .map((el) => (
            <div
              className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
              style={{ userSelect: 'none' }}
              onDragStart={(e) => {
                onDragStart(e, el);
              }}
              draggable
              key={el.str_value}
            >
              <div style={{ pointerEvents: 'none' }} data-dummy={el.str_value}>
                <TideLiteral data={el} show_handles={false} id='' />
              </div>
            </div>
          ))}

        {constant_name != null && (
          <div
            className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
            style={{ userSelect: 'none' }}
            onDragStart={(e) => {
              onDragStart(e, {
                evaluated: false,
                kind: 'constant_use',
                location: {
                  module: false,
                  name: constant_name,
                },
                metadata: {
                  node_id: '',
                },
              });
            }}
            draggable
            data-dummy={filter}
          >
            <div style={{ pointerEvents: 'none' }} data-dummy={constant_name}>
              <TideConstantUse
                data={
                  {
                    evaluated: false,
                    kind: 'constant_use',
                    location: {
                      module: false,
                      name: constant_name,
                    },
                    metadata: {},
                  } as Record<string, unknown>
                }
                hide_handles
                resetOnChange
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...({} as any)}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardActions>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          Filter :
          <Input value={filter} onChange={(v) => setFilter(v.target.value)} />
        </div>
      </CardActions>
    </Card>
  );
}
