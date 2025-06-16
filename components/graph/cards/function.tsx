import { NodeProps } from '@xyflow/react';
import { IImportedCardData } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import {
  createCodeFromCodeRepresentation,
  getNode,
  growExpressionFromChildIgnoreColor,
  turnTreeToExpressionRec,
} from '../utils';
import { useStore } from '../store';
import { useEffect, useState } from 'react';

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
  id,
  data,
}: NodeProps & { data: ITamaroFunctionCardData }) {
  const function_el = data.value;

  const { nodes, edges } = useStore();

  const [code, setCode] = useState(undefined as string | undefined);

  useEffect(() => {
    const visited = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node = getNode(nodes, id)! as any;
    const value = turnTreeToExpressionRec(nodes, edges, visited, node);
    const scaled_code = growExpressionFromChildIgnoreColor(
      nodes,
      edges,
      visited,
      node,
      value,
    );

    if (scaled_code[0] !== undefined)
      setCode(createCodeFromCodeRepresentation(scaled_code));
    else setCode(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges]);

  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      {function_el && (
        <FunctionTamaroCard
          el={function_el}
          module={data.module}
          show_handles
          returns_expression={code ? code : undefined}
        />
      )}
    </div>
  );
}
