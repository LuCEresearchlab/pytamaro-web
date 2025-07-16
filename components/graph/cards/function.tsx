import { NodeProps } from '@xyflow/react';
import { CommonNodeData, FunctionNode } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import useJudiciousDocData from '../../../src/documentation';
import ResultIcon from '../ResultIcon';

export function getHandleName(parameter_name: string) {
  return `input_${parameter_name}`;
}

export function getParameterName(handle_name: string) {
  return handle_name.startsWith('input_')
    ? handle_name.substring('input_'.length)
    : undefined;
}

export function TamaroFunctionCard(
  props: NodeProps<FunctionNode> & CommonNodeData,
) {
  const { data, show_handles } = props;
  const i = data.import as { module: string; name: string };

  const [el] = useJudiciousDocData([i.module]).map(
    (v) =>
      v.elements.find((o) => o.name === i.name) as
        | JudiciousFunction
        | undefined,
  );

  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      {el && (
        <FunctionTamaroCard
          el={el}
          module={i.module}
          show_handles={show_handles}
          returns_icon={
            <ResultIcon value={data.evaluated ? data.value : undefined} />
          }
        />
      )}
    </div>
  );
}
