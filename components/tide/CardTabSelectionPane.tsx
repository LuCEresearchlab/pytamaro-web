import { Card, CardActions, CardContent, Input } from '@mui/material';
import { useStore } from '../../src/tide/store';
import { DragEvent, useEffect, useState } from 'react';
import TamaroCard from '../TamaroCard';
import { JudiciousModuleElement } from './CardSelectionPane';
import { FLOAT_REGEX, STR_REGEX, TamaroLiteralCard } from './cards/literal';
import ConstantUse from './cards/constant_use';
import { check_const_name } from './cards/constant_definition';
import { TamaroCardNode } from './cards';
import {
  LiteralType,
  SoundType,
  UnsoundType,
} from '../../src/tide/language/expression';
import { TideSyntaxErrorInvalidLiteral_builder } from '../../src/tide/language/error_builders';
import { INT_REGEX } from '../../src/tide/language/utils';

interface CardSelectionPaneProps {
  values: JudiciousModuleElement[];
}

export function CardTabSelectionPane({ values }: CardSelectionPaneProps) {
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

  const onDragStart = function <T extends string>(
    event: DragEvent<HTMLDivElement>,
    type: T,
    data: (TamaroCardNode & { type: T })['data'],
  ) {
    setDragged({ type, data });
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
          .filter((el) => el.kind === 'function' || el.kind === 'constant')
          .filter((v) => v.name.toLowerCase().startsWith(filter))
          .map((el) => (
            <div
              className='compact_view hide_types hide_labels hide_handles hide_optionals'
              style={{ userSelect: 'none' }}
              onDragStart={(e) => {
                switch (el.kind) {
                  case 'function': {
                    onDragStart(e, 'function', {
                      children: new Map(),
                      evaluated: false,
                      import: { module: el.module, name: el.name },
                      kind: 'function_use',
                      metadata: {
                        node_id: '',
                      },
                    });
                    break;
                  }
                  case 'constant': {
                    onDragStart(e, 'constant', {
                      kind: 'constant_use',
                      evaluated: false,
                      import: { module: el.module, name: el.name },
                      metadata: {
                        node_id: '',
                      },
                    });
                    break;
                  }
                }
              }}
              draggable
              key={el.module + '$' + el.name}
            >
              <div style={{ pointerEvents: 'none' }}>
                <TamaroCard el={el} module={el.module} show_handles={false} />
              </div>
            </div>
          ))}
        {literals.map(({ value, type }) => (
          <div
            className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
            style={{ userSelect: 'none' }}
            onDragStart={(e) => {
              onDragStart(e, 'literal', {
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
              });
            }}
            draggable
            key={value}
          >
            <div style={{ pointerEvents: 'none' }} data-dummy={value}>
              <TamaroLiteralCard
                data={
                  {
                    evaluated: true,
                    kind: 'literal',
                    metadata: {
                      node_id: '',
                    },
                    str_value: value,
                    type,
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
                  } as Record<string, unknown>
                }
                hide_handles
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...({} as any)}
              />
            </div>
          </div>
        ))}

        {constant_name != null && (
          <div
            className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
            style={{ userSelect: 'none' }}
            onDragStart={(e) => {
              onDragStart(e, 'constant', {
                evaluated: false,
                kind: 'constant_use',
                import: {
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
              <ConstantUse
                data={
                  {
                    evaluated: false,
                    kind: 'constant_use',
                    import: {
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
