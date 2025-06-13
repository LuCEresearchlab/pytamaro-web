import { NodeProps } from '@xyflow/react';
import { IImportedCardData, Wrap } from '.';
import useJudiciousDocData from '../../../src/documentation';
import { JudiciousConstant } from '../../../src/schemas/documentation';
import TamaroCard from '../../TamaroCard';

export interface ITamaroConstantCardData extends IImportedCardData {
  wrap: Wrap<JudiciousConstant>;
}

export function getConstantCardData(module: string, function_name: string) {
  const judicious_module = useJudiciousDocData([module])[0];
  return judicious_module?.elements.find(
    (v) => v.name === function_name,
  )! as JudiciousConstant;
}

export function TamaroConstantCard({
  data,
}: NodeProps & { data: ITamaroConstantCardData }) {
  const function_el =
    data.wrap.obj || getConstantCardData(data.module, data.name);
  if (function_el) data.wrap.obj = function_el;

  return (
    <div className='compact_view hide_types hide_icons hide_output hide_optionals'>
      {function_el && (
        <TamaroCard el={function_el} module={data.module} show_handles />
      )}
    </div>
  );
}
