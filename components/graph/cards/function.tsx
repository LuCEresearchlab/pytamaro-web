import { NodeProps } from '@xyflow/react';
import { CodeRepresentation, IImportedCardData } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import { createCodeFromCodeRepresentation } from '../utils';

export interface ITamaroFunctionCardData extends IImportedCardData {
  value: JudiciousFunction;
  size?: { width: number; height: number };
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

  // useEffect(() => {
  //   // eslint-disable-next-line no-param-reassign
  //   data.representation = undefined;
  //   clearErrors(id);

  //   getFunctionHandles(function_el)
  //     .map(({ name }) => {
  //       const node = getFunctionParameterRelative(nodes, edges, id, name, true);
  //       const node2 = getFunctionParameterRelative(
  //         nodes,
  //         edges,
  //         id,
  //         name,
  //         false,
  //       );
  //       if (node != node2) return { name, message: 'type' };
  //       if (!node) return { name, message: 'missing_parameter' };
  //       const node_output_type = getHandleType(node, 'output');
  //       const input_type = getHandleType(
  //         getNode(nodes, id)!,
  //         getHandleName(name),
  //       );

  //       if (input_type !== node_output_type) {
  //         setEdges(
  //           edges.map((v) =>
  //             !(v.source === node.id && v.target === id)
  //               ? v
  //               : {
  //                   ...v,
  //                   className:
  //                     'invalid_type_edge ' +
  //                     (error_level === 'highlight' ? 'highlight_error' : ''),
  //                 },
  //           ),
  //         );
  //         return { name, message: 'type' };
  //       }
  //       return undefined;
  //     })
  //     .filter((v) => v)
  //     .map((v) => v as { name: string; message: 'missing_parameter' | 'type' })
  //     .forEach(({ name, message }) => {
  //       addError(id, getHandleName(name), message);
  //     });
  // }, [
  //   addError,
  //   clearErrors,
  //   data,
  //   edges,
  //   error_level,
  //   function_el,
  //   id,
  //   local_scale,
  //   nodes,
  //   setEdges,
  // ]);

  const code = data.representation
    ? ({
        expression: `show_graphic(${data.representation.expression})`,
        imports: data.representation.imports.concat({
          module: 'pytamaro',
          name: 'show_graphic',
        }),
      } as CodeRepresentation)
    : undefined;

  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      {function_el && (
        <FunctionTamaroCard
          el={function_el}
          module={data.module}
          show_handles
          returns_expression={
            code ? createCodeFromCodeRepresentation(code) : undefined
          }
        />
      )}
    </div>
  );
}
