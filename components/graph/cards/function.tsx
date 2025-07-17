import { NodeProps, useNodeConnections, useReactFlow } from '@xyflow/react';
import { ExtraneousNodeProps, FunctionNode } from '.';
import { FunctionTamaroCard } from '../../TamaroCard';
import { JudiciousFunction } from '../../../src/schemas/documentation';
import useJudiciousDocData from '../../../src/documentation';
import ResultIcon from '../ResultIcon';
import { useEffect, useMemo } from 'react';
import { useStore } from '../store';

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
  show_handles,
}: NodeProps<FunctionNode> & ExtraneousNodeProps) {
  const i = data.import as { module: string; name: string };

  const updateNodeData = useStore((state) => state.updateNodeData);

  const [el] = useJudiciousDocData([i.module]).map(
    (v) =>
      v.elements.find((o) => o.name === i.name) as
        | JudiciousFunction
        | undefined,
  );

  const connections = useNodeConnections({ handleType: 'target' });
  const { getNode } = useReactFlow();

  useEffect(() => {
    const newChildren = new Map(
      connections.map((v) => [
        getParameterName(v.targetHandle!),
        getNode(v.source)!.data,
      ]),
    );

    updateNodeData(id, (data) => ({
      ...data,
      children: newChildren,
      evaluated: false,
    }));
  }, [connections, getNode, id, updateNodeData]);

  const value = data.evaluated ? data.value : undefined;
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
