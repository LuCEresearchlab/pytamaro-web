import { Edge, Node } from '@xyflow/react';
import { getHandleType, getNode, getParents } from './utils';
import { TamaroCardNode, TideNodeMetadata } from './cards';
import { type_equality_rule } from '../../src/tide/expression';
import { EvaluatedContext } from '../../src/tide/context';

export function check_edge_typing(
  context: EvaluatedContext<TideNodeMetadata>,
  nodes: TamaroCardNode[],
  source_id: string,
  source_handle: string,
  target_id: string,
  target_handle: string,
) {
  const source_node = getNode(nodes, source_id)!;
  const origin_type = getHandleType(context, source_node, source_handle);
  console.log(source_node.id, source_handle, origin_type);

  const target_node = getNode(nodes, target_id)!;
  const target_type = getHandleType(context, target_node, target_handle);
  console.log(target_node.id, target_handle, target_type);

  return type_equality_rule(origin_type, target_type);
}

export function check_edge_looping(
  nodes: TamaroCardNode[],
  edges: Edge[],
  source: string,
  target: string,
) {
  if (getParents(nodes, edges, source).size != 0) return false;
  const visited: Set<string> = new Set();
  visited.add(source);

  const stack: Array<Node> = [getNode(nodes, target)!];

  while (stack.length !== 0) {
    const el = stack.pop()!;
    if (visited.has(el.id)) {
      return false;
    }

    const parents = getParents(nodes, edges, el);
    if (parents.size > 1) {
      return false;
    }

    visited.add(el.id);
    if (parents.size === 1) {
      const val = parents.values().next().value!;
      if (visited.has(val.id)) continue;
      stack.push(val);
    }
  }

  return true;
}
