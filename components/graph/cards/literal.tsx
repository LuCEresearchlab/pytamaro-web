import { Handle, Node, Position } from '@xyflow/react';
import { ITamaroCardData } from '.';
import { useState } from 'react';
import { Card, Input } from '@mui/material';

export interface ITamaroLiteralCardData extends ITamaroCardData {
  literal_type: 'float';
}

export function TamaroLiteralCard(
  props: Node & { data: ITamaroLiteralCardData; hide_handles?: boolean },
) {
  switch (props.data.literal_type) {
    case 'float':
      return FloatLiteralCard(props);
  }
}

const MAX_VALUE = 1e10;
const MIN_VALUE = -1e10;

function FloatLiteralCard({
  data,
  hide_handles,
}: Node & {
  data: ITamaroLiteralCardData & { literal_type: 'float' };
  hide_handles?: boolean;
}) {
  const [value, _setValue] = useState((data.wrap.obj as number) || 0);

  const setValue = (newValue: number) => {
    _setValue(newValue);
    data.wrap.obj = newValue;
  };
  return (
    <Card sx={{ margin: '0px' }} className='tamaro_card pane_container'>
      <Input
        sx={{ margin: '10px' }}
        onChange={(e) => {
          e.preventDefault();
          if (e.currentTarget.value.trim().length === 0)
            e.currentTarget.value = '0';
          if (e.currentTarget.value === '0-') {
            e.currentTarget.value = '-';
            return;
          }
          if (e.currentTarget.value === '-') {
            e.currentTarget.value = '0';
          }

          let new_value = Number.parseFloat(e.currentTarget.value);
          if (new_value != null && !isNaN(new_value)) {
            new_value = Math.max(Math.min(new_value, MAX_VALUE), MIN_VALUE);
            setValue(new_value);
          } else new_value = 0;

          const target = e.currentTarget;
          if (target.value !== String(new_value)) {
            target.value = String(new_value);
          }
        }}
        defaultValue={value}
      />
      {hide_handles !== true && (
        <Handle
          type='source'
          id='output'
          position={Position.Right}
          className='handle'
          style={{ opacity: '1' }}
        />
      )}
    </Card>
  );
}
