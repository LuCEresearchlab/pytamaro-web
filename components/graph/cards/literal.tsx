/* eslint-disable no-param-reassign */
import { Handle, Node, Position } from '@xyflow/react';
import { ITamaroCardData } from '.';
import { Card, Input } from '@mui/material';
import { useStore } from '../store';

export interface ITamaroLiteralCardData extends ITamaroCardData {
  literal_type: 'float';
  value: number;
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
  id,
  data,
  hide_handles = false,
}: Node & {
  data: ITamaroLiteralCardData & { literal_type: 'float' };
  hide_handles?: boolean;
}) {
  const { updateNodeData, invalidate_node } = useStore();

  const value = data.value;
  const setValue = (newValue: number) =>
    updateNodeData(id, { literal_type: 'float', value: newValue });

  return (
    <Card className='literal_card tamaro_card pane_container draggable'>
      <Input
        sx={{
          minWidth: '0px',
          flexShrink: '1',
          flexGrow: '0',
          flexBasis: '100px',
        }}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.preventDefault();
          if (e.currentTarget.value.trim().length === 0)
            e.currentTarget.value = '0';
          if (e.currentTarget.value === '0-') {
            e.currentTarget.value = '-';
            invalidate_node(id);
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
          invalidate_node(id);
        }}
        value={value}
      />
      <div
        style={{ flexGrow: '1', minWidth: '20px' }}
        className='drag-handle'
      ></div>
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
