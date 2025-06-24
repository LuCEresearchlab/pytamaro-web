import { Card, CardContent } from '@mui/material';
import { useStore } from './store';
import { DragEvent } from 'react';
import TamaroCard from '../TamaroCard';
import { JudiciousModuleElement } from './CardSelectionPane';
import { TamaroLiteralCard } from './cards/literal';

interface CardSelectionPaneProps {
  values: JudiciousModuleElement[];
}

export function CardTabSelectionPane({ values }: CardSelectionPaneProps) {
  const { setDragged } = useStore();

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
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '5px',
        }}
      >
        {values
          .filter((el) => el.kind === 'function' || el.kind === 'constant')
          .map((el) => (
            <div
              className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
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

        <div
          className='compact_view hide_types hide_labels hide_icons hide_handles hide_optionals'
          style={{ userSelect: 'none' }}
          onDragStart={(e) => {
            onDragStart(e, 'literal', {
              literal_type: 'float',
              value: 0,
            });
          }}
          draggable
        >
          <div style={{ pointerEvents: 'none' }}>
            <TamaroLiteralCard
              data={
                {
                  literal_type: 'float',
                  value: 0,
                } as Record<string, unknown>
              }
              hide_handles
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({} as any)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
