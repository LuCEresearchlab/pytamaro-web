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
      const data = node.data as unknown as ITamaroFunctionCardData;
      const function_el = data.value as JudiciousFunction;
      if (handle === 'output') return function_el?.returnValue?.type || 'null';
      const arg_name = getParameterName(handle);
      return (
        function_el?.parameters.find((v) => v.name === arg_name)?.type ||
        'Unknown'
      );
    }
    case 'literal': {
      const data = node.data as unknown as ITamaroLiteralCardData;
      return data.literal_type;
    }

    case 'constant': {
      const data = node.data as unknown as ITamaroConstantCardData;
      const cst = data.value as JudiciousConstant;

      return cst.type;
    }
  }
}

export function getAmountOfExpectConnections(node: Node) {
  if (!node.type) return 'Unknown';

  const type = node.type;

  if (!Object.keys(node_types).includes(type)) return 'Unknown';

  switch (node.type as CardType) {
    case 'function': {
      const data = node.data as unknown as ITamaroFunctionCardData;
      const fn = data.value as JudiciousFunction;
      return (
        fn.parameters.filter((v) => v.default == null).length +
        (fn.returnValue ? 1 : 0)
      );
    }
    case 'literal':
      return 1;
    case 'constant':
      return 1;
  }
}

function turnTreeToExpressionRec(
  nodes: Node[],
  edges: Edge[],
  visited: Set<string>,
  node: Node & { data: ITamaroCardData },
): [string | undefined, { module: string; name: string }[]] {
  if (!node?.type) return [undefined, []];
  if (visited.has(node.id)) {
    return [node.data.expression!, node.data.imports || []];
  }
  visited.add(node.id);

  const type = node.type;

  if (!Object.keys(node_types).includes(type)) return [undefined, []];

  switch (node.type as CardType) {
    case 'function': {
      const data = node.data as unknown as ITamaroFunctionCardData;
      const fn = data.value;

      const params = fn.parameters
        .filter((v) => v.default == null)
        .map((v) =>
          turnTreeToExpressionRec(
            nodes,
            edges,
            visited,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getFunctionParameterRelative(nodes, edges, node.id, v.name)! as any,
          ),
        );

      data.expression = params.find((v) => v[0] == null)
        ? undefined
        : `${fn.name}(${params.map((v) => v[0]).join(',')})`;

      data.imports = params.map((v) => v[1]).reduce((a, b) => a.concat(b), []);

      if (data.expression) {
        data.imports.push({ module: data.module, name: data.name });
      }

      return [data.expression, data.imports];
    }
    case 'literal': {
      const data = node.data as unknown as ITamaroLiteralCardData;
      data.expression = String(data.value || 0);
      return [data.expression, []];
    }
    case 'constant': {
      const data = node.data as unknown as ITamaroConstantCardData;
      data.expression = data.name;
      data.imports = [{ module: data.module, name: data.name }];
      return [data.expression, [{ module: data.module, name: data.name }]];
    }
  }
}

export function reassignExpression(nodes: Node[], edges: Edge[]) {
  const visited = new Set<string>();

  nodes.forEach((v) => {
    if (visited.has(v.id)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    turnTreeToExpressionRec(nodes, edges, visited, v as any);
  });
}

export function createCode(
  imports: { module: string; name: string }[],
  expression: string,
) {
  const map: Map<string, string[]> = imports
    .concat({ module: 'pytamaro', name: 'show_graphic' })
    .reduce((a: Map<string, string[]>, b) => {
      if (!a.has(b.module)) a.set(b.module, []);
      a.get(b.module)!.push(b.name);
      return a;
    }, new Map<string, string[]>());

  const import_map =
    map
      .keys()
      .toArray()
      .map((k) => `from ${k} import ${map.get(k)!.toSorted().join(', ')}`)
      .join('\n') + '\n\n';

  return import_map + `show_graphic(${expression})`;
}

export function turnTreeToCode(
  nodes: Node[],
  edges: Edge[],
  node: Node,
): string {
  const visited = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = turnTreeToExpressionRec(nodes, edges, visited, node as any);

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
