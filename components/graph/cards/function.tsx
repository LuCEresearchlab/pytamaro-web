import { NodeProps } from '@xyflow/react';
import { IImportedCardData } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import { createCode } from '../utils';

export interface ITamaroFunctionCardData extends IImportedCardData {
  value: JudiciousFunction;
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
  const function_el = data.value;

  const code = (() =>
    data.expression
      ? createCode(data.imports || [], data.expression)
      : undefined)();

  return (
    <div className='compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      {function_el && (
        <FunctionTamaroCard
          el={function_el}
          module={data.module}
          show_handles
          returns_expression={code || ''}
        />
      )}
    </div>
  );
}
