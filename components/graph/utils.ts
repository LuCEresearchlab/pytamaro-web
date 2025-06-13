'use client';
import { Edge, Node } from '@xyflow/react';
import {
  getHandleName,
  getParameterName,
  ITamaroFunctionCardData,
} from './cards/function';
import {
  JudiciousConstant,
  JudiciousFunction,
} from '../../src/schemas/documentation';
import { CardType, ITamaroCardData, node_types } from './cards';
import { ITamaroLiteralCardData } from './cards/literal';
import { ITamaroConstantCardData } from './cards/constant';

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
      .map((v) => [v.targetHandle || '', getNode(nodes, v.target)!]),
  );
}

export function getParents(nodes: Node[], edges: Edge[], node: string | Node) {
  const node_id = typeof node === 'string' ? node : node.id;

  return new Map(
    edges
      .filter((v) => v.source === node_id)
      .map((v) => [v.sourceHandle || '', getNode(nodes, v.source)!]),
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

  return neighbour ? getNode(nodes, neighbour) : undefined;
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
      if (handle === 'output') return function_el?.returnValue?.type || 'null';
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

    case 'constant': {
      const data = node.data as any as ITamaroLiteralCardData;
      const cst = data.wrap.obj as JudiciousConstant;

      return cst.type;
    }
  }
}

export function getAmountOfExpectConnections(node: Node) {
  if (!node.type) return 'Unknown';

  const type = node.type;

  if (!Object.keys(node_types).includes(type)) return 'Unknown';

  switch (node.type as CardType) {
    case 'function':
      const data = node.data as any as ITamaroFunctionCardData;
      const fn = data.wrap.obj as JudiciousFunction;
      return (
        fn.parameters.filter((v) => v.default == null).length +
        (fn.returnValue ? 1 : 0)
      );
    case 'literal':
      return 1;
    case 'constant':
      return 1;
  }
}

function turnTreeToExpressionRec(
  nodes: Node[],
  edges: Edge[],
  node: Node,
): [string, { module: string; name: string }[]] {
  if (!node.type) return ['UNKNOWN', [] as any];

  const type = node.type;

  if (!Object.keys(node_types).includes(type)) return ['UNKNOWN', [] as any];

  switch (node.type as CardType) {
    case 'function': {
      const data = node.data as any as ITamaroFunctionCardData;
      const fn = data.wrap.obj!;

      const params = fn.parameters
        .filter((v) => v.default == null)
        .map((v) =>
          turnTreeToExpressionRec(
            nodes,
            edges,
            getFunctionParameterRelative(nodes, edges, node.id, v.name)!,
          ),
        );

      return [
        `${fn.name}(${params.map((v) => v[0]).join(',')})`,
        params
          .map((v) => v[1])
          .reduce((a, b) => a.concat(b), [])
          .concat({ module: data.module, name: data.name }),
      ];
    }
    case 'literal': {
      const data = node.data as any as ITamaroLiteralCardData;
      return [String(data.wrap.obj || 0), [] as any];
    }
    case 'constant': {
      const data = node.data as any as ITamaroConstantCardData;
      return [data.name, [{ module: data.module, name: data.name }]];
    }
  }
}

export function turnTreeToCode(
  nodes: Node[],
  edges: Edge[],
  node: Node,
): string {
  const result = turnTreeToExpressionRec(nodes, edges, node);

  const map: Map<string, string[]> = result[1].reduce(
    (a: Map<string, string[]>, b) => {
      if (!a.has(b.module)) a.set(b.module, []);
      a.get(b.module)!.push(b.name);
      return a;
    },
    new Map<string, string[]>(),
  );

  const import_map =
    map
      .keys()
      .toArray()
      .map((k) => `from ${k} import ${map.get(k)!.toSorted().join(', ')}`)
      .join('\n') + '\n\n';

  return import_map + result[0];
}
