import { Edge, Node } from '@xyflow/react';
import {
  getHandleType,
  getNode,
  getParents,
  getSubTreeFromRoot,
} from './utils';
import { TideNode, TideNodeMetadata } from '../../components/tide/cards';
import { type_equality_rule } from './language/typing';
import { EvaluatedDefinitions } from './language/definitions';

export function check_edge_typing(
  context: EvaluatedDefinitions<TideNodeMetadata>,
  nodes: TideNode[],
  source_id: string,
  source_handle: string,
  target_id: string,
  target_handle: string,
) {
  const source_node = getNode(nodes, source_id)!;
  const origin_type = getHandleType(context, source_node, source_handle);

  const target_node = getNode(nodes, target_id)!;
  const target_type = getHandleType(context, target_node, target_handle);

  return type_equality_rule(origin_type, target_type);
}

export function check_edge_looping(
  nodes: TideNode[],
  edges: Edge[],
  source: string,
  target: string,
) {
  return (
    !getSubTreeFromRoot(nodes, edges, source).includes(target) &&
    !getSubTreeFromRoot(nodes, edges, target).includes(source)
  );
}
