import { Edge, Node } from '@xyflow/react';
import { getChildren, getHandleType, getNode, getParents } from './utils';

export function check_edge_typing(
  nodes: Node[],
  source_id: string,
  source_handle: string,
  target_id: string,
  target_handle: string,
) {
  const source_node = getNode(nodes, source_id)!;
  const origin_type = getHandleType(source_node, source_handle);

  const target_node = getNode(nodes, target_id)!;
  const target_type = getHandleType(target_node, target_handle);

  return origin_type === target_type && origin_type !== 'null';
}

export function check_edge_looping(
  nodes: Node[],
  edges: Edge[],
  source: string,
  target: string,
) {
  if (getChildren(nodes, edges, source).size != 0) return false;
  const visited: Set<string> = new Set();
  visited.add(source);

  const stack: Array<Node> = [getNode(nodes, target)!];

  while (stack.length !== 0) {
    const el = stack.pop()!;
    if (visited.has(el.id)) return false;

    const parents = getParents(nodes, edges, el);
    if (parents.size > 1) return false;

    visited.add(el.id);
    if (parents.size === 1) stack.push(parents.values().next().value!);
  }

  return true;
}
