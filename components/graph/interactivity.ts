import { Edge, Node } from '@xyflow/react';
import {
  getAmountOfExpectConnections,
  getChildren,
  getHandleType,
  getNode,
  getParents,
  toEnglishName,
} from './utils';

export function check_edge_typing(
  nodes: Node[],
  source_id: string,
  source_handle: string,
  target_id: string,
  target_handle: string,
) {
  const source_node = getNode(nodes, source_id)!;
  const origin_type = getHandleType(nodes, source_node, source_handle);

  const target_node = getNode(nodes, target_id)!;
  const target_type = getHandleType(nodes, target_node, target_handle);

  return type_equality_rule(origin_type, target_type);
}

export function type_equality_rule(type1: string, type2: string) {
  const en_type1 = toEnglishName(type1);
  const en_type2 = toEnglishName(type2);

  return en_type1 && en_type2 && en_type1 === en_type2 && type1 !== 'null';
}

export function check_edge_looping(
  nodes: Node[],
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

export function check_valid_graph(nodes: Node[], edges: Edge[]) {
  return !nodes.find((node) => {
    return (
      getChildren(nodes, edges, node).size +
        getParents(nodes, edges, node).size !==
      getAmountOfExpectConnections(node)
    );
  });
}
