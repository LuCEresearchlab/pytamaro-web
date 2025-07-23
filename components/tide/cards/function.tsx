import { NodeProps, useNodeConnections } from '@xyflow/react';
import { ExtraneousNodeProps, FunctionNode } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import useJudiciousDocData from '../../../src/documentation';
import ResultIcon from '../ResultIcon';
import { useEffect, useMemo } from 'react';
import { useStore } from '../../../src/tide/store';
import { getNode } from '../../../src/tide/utils';
import { useShallow } from 'zustand/shallow';

export function getHandleName(parameter_name: string) {
  return `input_${parameter_name}`;
}

export function getParameterName(handle_name: string) {
  return handle_name.startsWith('input_')
    ? handle_name.substring('input_'.length)
    : undefined;
}

export function TideFunctionuse({
  id,
  data,
  show_handles,
}: Pick<
  NodeProps<FunctionNode> & ExtraneousNodeProps,
  'id' | 'data' | 'show_handles'
>) {
  const i = data.location as { module: string; name: string };

  const { updateNodeData, nodes } = useStore(
    useShallow((state) => ({
      updateNodeData: state.updateNodeData,
      nodes: state.nodes,
    })),
  );

  const [el] = useJudiciousDocData([i.module]).map(
    (v) =>
      v.elements.find((o) => o.name === i.name) as
        | JudiciousFunction
        | undefined,
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const connections = show_handles
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useNodeConnections({ handleType: 'target' })
    : [];

  useEffect(() => {
    const newChildren = new Map(
      connections.map((v) => [
        getParameterName(v.targetHandle!),
        getNode(nodes, v.source)!.data,
      ]),
    );

    if (data.children.size !== newChildren.size)
      updateNodeData(id, (data) => ({
        ...data,
        children: newChildren,
        evaluated: false,
      }));
  }, [
    connections,
    data.children.size,
    id,
    nodes,
    show_handles,
    updateNodeData,
  ]);

  const value = data.evaluated && 'value' in data ? data.value : undefined;
  const result_icon = useMemo(() => {
    return ResultIcon({ value });
  }, [value]);

  return (
    <div className='drag-handle compact_view hide_types hide_icons hide_output hide_optionals hide_labels'>
      {el && (
        <FunctionTamaroCard
          el={el}
          module={i.module}
          show_handles={show_handles}
          returns_icon={result_icon}
        />
      )}
    </div>
  );
}
