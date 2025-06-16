import { NodeProps } from '@xyflow/react';
import { IImportedCardData } from '.';
import { JudiciousConstant } from '../../../src/schemas/documentation';
import TamaroCard from '../../TamaroCard';

export interface ITamaroConstantCardData extends IImportedCardData {
  value: JudiciousConstant;
}

export function TamaroConstantCard({
  data,
}: NodeProps & { data: ITamaroConstantCardData }) {
  const function_el = data.value;
  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals'>
      {function_el && (
        <TamaroCard el={function_el} module={data.module} show_handles />
      )}
    </div>
  );
}
