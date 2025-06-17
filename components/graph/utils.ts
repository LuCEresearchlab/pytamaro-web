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
import {
  CardType,
  CodeRepresentation,
  ImportReference,
  ITamaroCardData,
  node_types,
} from './cards';
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
  unsafe_type: boolean = false,
) {
  const neighbour =
    edges.find(
      (v) =>
        v.source === id &&
        v.sourceHandle === handle &&
        (unsafe_type || !(v.className || '').includes('invalid_type_edge')),
    )?.target ||
    edges.find(
      (v) =>
        v.target === id &&
        v.targetHandle === handle &&
        (unsafe_type || !(v.className || '').includes('invalid_type_edge')),
    )?.source;

  return neighbour ? getNode(nodes, neighbour) : undefined;
}

export function getFunctionParameterRelative(
  nodes: Node[],
  edges: Edge[],
  id: string,
  parameter: string,
  unsafe_type: boolean = false,
) {
  return getRelative(nodes, edges, id, getHandleName(parameter), unsafe_type);
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

export function getFunctionHandles(fn: JudiciousFunction) {
  return fn.parameters
    .filter((v) => v.default == null)
    .map((v) => ({ name: v.name, type: v.type }));
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

export const TRANSPARENT_IMPORT: ImportReference = {
  module: 'pytamaro',
  name: 'transparent',
};

export const TRANSPARENT_CODE: CodeRepresentation = [
  'transparent',
  [TRANSPARENT_IMPORT],
];

export function turnTreeToExpressionRec(
  nodes: Node[],
  edges: Edge[],
  visited: Set<string>,
  node: Node & { data: ITamaroCardData },
  transparent?: boolean,
): CodeRepresentation {
  if (!node?.type) return [undefined, []];
  visited.add(node.id);

  const type = node.type;

  if (!Object.keys(node_types).includes(type)) return [undefined, []];

  switch (node.type as CardType) {
    case 'function': {
      const data = node.data as unknown as ITamaroFunctionCardData;
      const fn = data.value;

      if (transparent && fn.returnValue && fn.returnValue.type === 'Color')
        return TRANSPARENT_CODE;

      const params = fn.parameters
        .filter((v) => v.default == null)
        .map((v) =>
          turnTreeToExpressionRec(
            nodes,
            edges,
            visited,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getFunctionParameterRelative(nodes, edges, node.id, v.name)! as any,
            transparent,
          ),
        );

      const expression = params.find((v) => v[0] == null)
        ? undefined
        : `${fn.name}(${params.map((v) => v[0]).join(',')})`;

      const imports = params
        .map((v) => v[1])
        .reduce((a, b) => a.concat(b), [])
        .concat({ module: data.module, name: data.name });

      return [expression, imports];
    }
    case 'literal': {
      const data = node.data as unknown as ITamaroLiteralCardData;
      const expression = String(data.value || 0);
      return [expression, []];
    }
    case 'constant': {
      const data = node.data as unknown as ITamaroConstantCardData;

      if (transparent && data.value.type === 'Color') return TRANSPARENT_CODE;

      const expression = data.name;
      const imports = [{ module: data.module, name: data.name }];
      return [expression, imports];
    }
  }
}

export function growExpressionFromChildIgnoreColor(
  nodes: Node[],
  edges: Edge[],
  visited: Set<string>,
  child: Node,
  child_code: CodeRepresentation,
): CodeRepresentation {
  const parent_edge = edges.find((v) => v.source === child.id);
  if (!parent_edge) return child_code;

  const parent = getNode(nodes, parent_edge.target)!;

  switch (parent.type as CardType) {
    case 'function': {
      const data = parent.data as unknown as ITamaroFunctionCardData;
      const fn = data.value;

      const params = fn.parameters
        .filter((v) => v.default == null)
        .map(
          (v) =>
            getFunctionParameterRelative(
              nodes,
              edges,
              parent.id,
              v.name,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            )! as any,
        )
        .map((node) =>
          node && node.id === child.id
            ? child_code
            : turnTreeToExpressionRec(nodes, edges, visited, node, true),
        );

      const expression = params.find((v) => v[0] == null)
        ? undefined
        : `${fn.name}(${params.map((v) => v[0]).join(',')})`;

      const imports = params
        .map((v) => v[1])
        .reduce((a, b) => a.concat(b), [])
        .concat({ module: data.module, name: data.name });

      if (!expression) return child_code;
      return [expression, imports];
    }
    default:
      throw new Error('Should not happens, as only functions have children');
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

export function createCodeFromCodeRepresentation(code: CodeRepresentation) {
  const map: Map<string, string[]> = code[1]
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

  return import_map + `show_graphic(${code[0]})`;
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
