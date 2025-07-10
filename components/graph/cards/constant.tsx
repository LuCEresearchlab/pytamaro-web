import { NodeProps } from '@xyflow/react';
import { IImportedCardData } from '.';
import { JudiciousConstant } from '../../../src/schemas/documentation';
import TamaroCard, { ConstantTamaroCard } from '../../TamaroCard';
import ResultIcon from '../ResultIcon';

export interface ITamaroConstantCardData extends IImportedCardData {
  value: JudiciousConstant;
}

export function TamaroConstantCard(
  props: NodeProps & { data: ITamaroConstantCardData },
) {
  const { data } = props;
  const function_el = data.value;
  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals'>
      {function_el && (
        <ConstantTamaroCard
          el={function_el}
          module={data.module}
          show_handles
          returns_icon={<ResultIcon node_props={props} />}
        />
      )}
    </div>
  );
}
