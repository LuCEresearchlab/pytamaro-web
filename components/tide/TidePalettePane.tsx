import { Card, CardActions, CardContent, Input } from '@mui/material';
import { useStore } from '../../src/tide/store';
import { DragEvent, useEffect, useState } from 'react';
import { TideLiteral } from './cards/literal';
import { check_const_name } from './cards/constant_definition';
import {
  FunctionNode,
  ConstantNode,
  TamaroCardNode,
  LiteralNode,
} from './cards';
import { LiteralType, SoundType } from '../../src/tide/language/typing';
import {
  ImportedConstantDefinition,
  ImportedDefinition,
  ImportedFunctionDefinition,
} from '../../src/tide/language/definitions';
import { TideConstantUse } from './cards/constant_use';
import { ConstantTamaroCard, FunctionTamaroCard } from '../TamaroCard';
import { TideJudiciousMetadata } from '../../src/tide/judiciours_to_tide';
import {
  JudiciousConstant,
  JudiciousFunction,
} from '../../src/schemas/documentation';
import {
  INT_REGEX,
  FLOAT_REGEX,
  STR_REGEX,
} from '../../src/tide/language/phases/syntax';

export function TidePalettePane({
  values,
}: {
  values: ImportedDefinition<TideJudiciousMetadata, 'evaluated'>[];
}) {
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
          value:
            filter === '' || !filter.match(v.regex)
              ? v.value
              : v.type !== SoundType.Float || filter.includes('.')
                ? filter
                : filter + '.0',
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
          .map(
            (
              el,
            ):
              | {
                  def: ImportedFunctionDefinition<
                    TideJudiciousMetadata,
                    'evaluated'
                  >;
                  el: FunctionNode['data'];
                }
              | {
                  def: ImportedConstantDefinition<
                    TideJudiciousMetadata,
                    'evaluated'
                  >;
                  el: ConstantNode['data'];
                } => {
              switch (el.kind) {
                case 'function_definition': {
                  return {
                    def: el,
                    el: {
                      input: el.location.name,
                    } as FunctionNode['data'],
                  };
                  break;
                }
                case 'constant_definition': {
                  return {
                    def: el,
                    el: {
                      input: el.location.name,
                    } as ConstantNode['data'],
                  };
                  break;
                }
              }
            },
          )
          .map(({ el, def }) => (
            <div
              className='compact_view hide_types hide_labels hide_handles hide_optionals'
              style={{ userSelect: 'none' }}
              onDragStart={(e) => onDragStart(e, el)}
              draggable
              key={el.input}
            >
              <div style={{ pointerEvents: 'none' }}>
                {def.kind === 'function_definition' ? (
                  <FunctionTamaroCard
                    el={def.metadata?.judicious as JudiciousFunction}
                    module={def.location.module}
                    show_handles={false}
                  />
                ) : (
                  <ConstantTamaroCard
                    el={def.metadata?.judicious as JudiciousConstant}
                    module={def.location.module}
                    show_handles={false}
                  />
                )}
              </div>
            </div>
          ))}
        {literals
          .map(({ value }): LiteralNode['data'] => {
            return {
              input: value,
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
              key={el.input}
            >
              <div style={{ pointerEvents: 'none' }} data-dummy={el.input}>
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
                input: constant_name,
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
