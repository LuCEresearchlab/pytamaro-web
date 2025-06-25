import { Card, CardActions, CardContent, Input } from '@mui/material';
import { useStore } from './store';
import { DragEvent, useEffect, useState } from 'react';
import TamaroCard from '../TamaroCard';
import { JudiciousModuleElement } from './CardSelectionPane';
import { FLOAT_REGEX, STR_REGEX, TamaroLiteralCard } from './cards/literal';

interface CardSelectionPaneProps {
  values: JudiciousModuleElement[];
}

export function CardTabSelectionPane({ values }: CardSelectionPaneProps) {
  const { setDragged } = useStore();

  const [filter, setFilter] = useState('');

  const [literals, setLiterals] = useState(
    [] as { regex: RegExp; value: string; type: string }[],
  );

  useEffect(() => {
    setLiterals(
      [
        { regex: /$^/, value: 'False', type: 'bool' },
        { regex: /$^/, value: 'True', type: 'bool' },
        { regex: FLOAT_REGEX, value: '200.0', type: 'float' },
        { regex: STR_REGEX, value: '"Abc"', type: 'str' },
      ]
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
  }, [filter, setLiterals]);

  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    type: string,
    data: Record<string, unknown>,
  ) => {
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
                onDragStart(e, el.kind, {
                  module: el.module,
                  name: el.name,
                  value: el,
                } as Record<string, unknown>);
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
                literal_type: type,
                value,
              });
            }}
            draggable
            key={value}
          >
            <div style={{ pointerEvents: 'none' }} data-dummy={value}>
              <TamaroLiteralCard
                data={
                  {
                    literal_type: type,
                    value,
                  } as Record<string, unknown>
                }
                hide_handles
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...({} as any)}
              />
            </div>
          </div>
        ))}
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
