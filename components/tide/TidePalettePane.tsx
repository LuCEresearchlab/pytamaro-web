/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Card, CardContent } from '@mui/material';
import { uniq } from 'lodash';
import { DragEvent, useEffect, useState } from 'react';
import {
  JudiciousConstant,
  JudiciousFunction,
} from '../../src/schemas/documentation';
import { TideJudiciousMetadata } from '../../src/tide/judiciours_to_tide';
import {
  ImportedConstantDefinition,
  ImportedDefinition,
  ImportedFunctionDefinition,
} from '../../src/tide/language/definitions';
import {
  FLOAT_REGEX,
  INT_REGEX,
  STR_REGEX,
} from '../../src/tide/language/phases/syntax';
import { LiteralType, SoundType } from '../../src/tide/language/typing';
import { useStore } from '../../src/tide/store';
import {
  ConstantNode,
  FunctionNode,
  LiteralNode,
  TamaroCardNode,
} from './cards';
import { check_const_name } from './cards/constant_definition';
import { TideConstantUse } from './cards/constant_use';
import { TideLiteral } from './cards/literal';
import { ConstantTamaroCard, FunctionTamaroCard } from './cards/TamaroCard';

export const LITERALS_LIBRARY = 'Literals';
export const CONSTANT_LIBRARY = 'User Constants';

export function TidePalettePane({
  values,
  filter,
  library,
}: {
  values: ImportedDefinition<TideJudiciousMetadata, 'evaluated'>[];
  filter: string;
  library: string;
}) {
  const { setDragged, reserved_names, nodes } = useStore();

  const defined_constants = uniq(
    nodes
      .filter((v) => v.type === 'constant_definition')
      .map((v) => v.data.input),
  ).filter(
    (name) =>
      name !== '' && name.toLowerCase().startsWith(filter.toLowerCase()),
  );

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
          { regex: FLOAT_REGEX, value: '3.14', type: SoundType.Float },
          { regex: INT_REGEX, value: '200', type: SoundType.Int },
          { regex: STR_REGEX, value: '"PyTamaro"', type: SoundType.Str },
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

  const onDragStart = function <T extends TamaroCardNode>(
    event: DragEvent<HTMLDivElement>,
    type: T['type'],
    data: T['data'],
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    setDragged({
      type,
      data,
      grabOffset: { x: event.clientX - rect.left, y: event.clientY - rect.top },
    });
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
          overflow: 'auto',
          alignItems: 'center',
        }}
      >
        {library !== LITERALS_LIBRARY &&
          library !== CONSTANT_LIBRARY &&
          values
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
                        module: el.location.module as string,
                      } as FunctionNode['data'],
                    };
                    break;
                  }
                  case 'constant_definition': {
                    return {
                      def: el,
                      el: {
                        input: el.location.name,
                        module: el.location.module as string,
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
                onDragStart={(e) =>
                  onDragStart(
                    e,
                    def.kind === 'function_definition'
                      ? 'function'
                      : 'constant',
                    el,
                  )
                }
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
        {library === LITERALS_LIBRARY &&
          literals
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
                  onDragStart(e, 'literal', el);
                }}
                draggable
                key={el.input}
              >
                <div style={{ pointerEvents: 'none' }} data-dummy={el.input}>
                  <TideLiteral data={el} show_handles={false} id='' />
                </div>
              </div>
            ))}

        {library === CONSTANT_LIBRARY &&
          uniq([
            ...(constant_name != null ? [constant_name] : []),
            ...defined_constants,
          ]).map((name) => (
            <div
              className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
              style={{ userSelect: 'none' }}
              onDragStart={(e) => {
                onDragStart(e, 'constant', {
                  input: name,
                });
              }}
              draggable
              key={name}
              data-dummy={name}
            >
              <div style={{ pointerEvents: 'none' }} data-dummy={name}>
                <TideConstantUse
                  data={
                    {
                      input: name,
                      evaluated: false,
                      kind: 'constant_use',
                      location: {
                        module: false,
                        name,
                      },
                      metadata: {},
                    } as Record<string, unknown>
                  }
                  hide_handles
                  resetOnChange
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/jsx-props-no-spreading
                  {...({} as any)}
                />
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
