import { NodeProps } from '@xyflow/react';
import { IImportedCardData } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import {
  createCodeFromCodeRepresentation,
  getFunctionHandles,
  getFunctionParameterRelative,
  getHandleType,
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

  const { nodes, edges, setEdges, addError, clearErrors } = useStore();

  const [code, setCode] = useState(undefined as string | undefined);

  useEffect(() => {
    clearErrors(id);

    getFunctionHandles(function_el)
      .map(({ name, type }) => {
        const node = getFunctionParameterRelative(nodes, edges, id, name, true);
        const node2 = getFunctionParameterRelative(
          nodes,
          edges,
          id,
          name,
          false,
        );
        if (node != node2) return { name, message: 'type' };
        if (!node) return { name, message: 'missing_parameter' };
        const node_output_type = getHandleType(node, 'output');
        const input_type = getHandleType(
          getNode(nodes, id)!,
          getHandleName(name),
        );

        if (input_type !== node_output_type) {
          setEdges(
            edges.map((v) =>
              !(v.source === node.id && v.target === id)
                ? v
                : { ...v, className: 'invalid_type_edge' },
            ),
          );
          return { name, message: 'type' };
        }
        return undefined;
      })
      .filter((v) => v)
      .map((v) => v as { name: string; message: 'missing_parameter' | 'type' })
      .forEach(({ name, message }) => {
        addError(id, getHandleName(name), message);
      });

    const visited = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node = getNode(nodes, id);
    if (!node) return;
    const value = turnTreeToExpressionRec(nodes, edges, visited, node as any);
    const scaled_code = growExpressionFromChildIgnoreColor(
      nodes,
      edges,
      visited,
      node,
      value,
    );

    if (scaled_code[0] !== undefined)
      setCode(createCodeFromCodeRepresentation(value));
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
