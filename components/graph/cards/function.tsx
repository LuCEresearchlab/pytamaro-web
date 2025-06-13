import { NodeProps } from '@xyflow/react';
import { IImportedCardData, Wrap } from '.';
import TamaroCard from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import useJudiciousDocData from '../../../src/documentation';

export interface ITamaroFunctionCardData extends IImportedCardData {
  wrap: Wrap<JudiciousFunction>;
}

export function getFunctionCardData(module: string, function_name: string) {
  const judicious_module = useJudiciousDocData([module])[0];
  return judicious_module?.elements.find(
    (v) => v.name === function_name,
  )! as JudiciousFunction;
}

export function getHandleName(parameter_name: string) {
  return `input_${parameter_name}`;
}

export function getParameterName(handle_name: string) {
  return handle_name.startsWith('input_')
    ? handle_name.substring('input_'.length)
    : undefined;
}

export function TamaroFunctionCard({
  data,
}: NodeProps & { data: ITamaroFunctionCardData }) {
  const function_el =
    data.wrap.obj || getFunctionCardData(data.module, data.name);
  if (function_el) data.wrap.obj = function_el;

  return (
    <div className='compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      {function_el && (
        <TamaroCard el={function_el} module={data.module} show_handles />
      )}
    </div>
  );
}
