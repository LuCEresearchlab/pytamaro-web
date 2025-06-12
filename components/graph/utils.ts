'use client';
import { Edge, Node } from '@xyflow/react';
import {
  getHandleName,
  getParameterName,
  ITamaroFunctionCardData,
} from './cards/function';
import { JudiciousFunction } from '../../src/schemas/documentation';
import { CardType, ITamaroCardData, node_types } from './cards';
import { ITamaroLiteralCardData } from './cards/literal';

export function getNode(nodes: Node[], id: string) {
  return nodes.find((v) => v.id === id);
}

export function getSource(nodes: Node[], edge: Edge) {
  return getNode(nodes, edge.source);
}

export function getTarget(nodes: Node[], edge: Edge) {
  return getNode(nodes, edge.target);
}

export function getChildren(nodes: Node[], edges: Edge[], node: string | Node) {
  const node_id = typeof node === 'string' ? node : node.id;

  return new Map(
    edges
      .filter((v) => v.target === node_id)
      .map((v) => [v.targetHandle, getNode(nodes, v.target)]),
  );
}

export function getRelative(
  nodes: Node[],
  edges: Edge[],
  id: string,
  handle: string,
) {
  const neighbour =
    edges.find((v) => v.source === id && v.sourceHandle === handle)?.target ||
    edges.find((v) => v.target === id && v.targetHandle === handle)?.source;

  return neighbour ? getNode(nodes, neighbour) : neighbour;
}

export function getFunctionParameterRelative(
  nodes: Node[],
  edges: Edge[],
  id: string,
  parameter: string,
) {
  return getRelative(nodes, edges, id, getHandleName(parameter));
}

export function getHandleType(node: Node, handle: string) {
  if (!node.type) return 'Unknown';

  const type = node.type;

  if (!Object.keys(node_types).includes(type)) return 'Unknown';

  switch (node.type as CardType) {
    case 'function': {
      const data = node.data as any as ITamaroFunctionCardData;
      const function_el = data.wrap.obj as JudiciousFunction | undefined;
      const arg_name = getParameterName(handle);
      return (
        function_el?.parameters.find((v) => v.name === arg_name)?.type ||
        'Unknown'
      );
    }
    case 'literal': {
      const data = node.data as any as ITamaroLiteralCardData;
      return data.literal_type;
    }
  }
}
