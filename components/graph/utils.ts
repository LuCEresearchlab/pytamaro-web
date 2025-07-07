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
  node_types,
} from './cards';
import { ITamaroLiteralCardData } from './cards/literal';
import { ITamaroConstantCardData } from './cards/constant';
import { ITamaroConstantDefinitionCardData } from './cards/constant_definition';

export function getNode(nodes: Node[], id: string) {
  return nodes.find((v) => v.id === id);
}

export function getSource(nodes: Node[], edge: Edge) {
  return getNode(nodes, edge.source);
}

export function getTarget(nodes: Node[], edge: Edge) {
  return getNode(nodes, edge.target);
}

export function getChildren(
  nodes: Node[],
  edges: Edge[],
  node: string | Node,
  unsafe_type: boolean = false,
) {
  const node_id = typeof node === 'string' ? node : node.id;

  return new Map(
    edges
      .filter(
        (v) =>
          v.target === node_id &&
          (unsafe_type || !(v.className || '').includes('invalid_type_edge')),
      )
      .map((v) => [v.targetHandle || '', getNode(nodes, v.source)!]),
  );
}

export function getParents(
  nodes: Node[],
  edges: Edge[],
  node: string | Node,
  unsafe_type: boolean = false,
) {
  const node_id = typeof node === 'string' ? node : node.id;

  return new Map(
    edges
      .filter(
        (v) =>
          v.source === node_id &&
          (unsafe_type || !(v.className || '').includes('invalid_type_edge')),
      )
      .map((v) => [v.sourceHandle || '', getNode(nodes, v.target)!]),
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

export function getHandleType(nodes: Node[], node: Node, handle: string) {
  if (!node.type) return 'Unknown';

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
      return data.literal_type || 'Unknown';
    }

    case 'constant': {
      const data = node.data as unknown as ITamaroConstantCardData;
      const cst = data.value as JudiciousConstant;

      return cst.type;
    }

    case 'constant_definition': {
      return 'Unknown'; // The Constant Definition return value is defined by the source of the edge, so we can't assign a type before the connection
    }

    case 'constant_use': {
      const { name } =
        node.data as unknown as ITamaroConstantDefinitionCardData;

      const definitions = nodes.filter(
        (v) => v.type === 'constant_definition' && v.data.name === name,
      );

      if (definitions.length !== 1) return 'Unknown';

      return definitions[0]!.data.type as string;
    }

    default: {
      return 'Unknown';
    }
  }
}

export function getSubTreeFromRoot(
  nodes: Node[],
  edges: Edge[],
  root: Node | string,
): string[] {
  const descendants: string[] = [];
  const visited = new Set<string>();
  const stack = [typeof root === 'string' ? getNode(nodes, root) : root];

  while (stack.length !== 0) {
    const el = stack.shift()!;

    if (visited.has(el.id)) continue;
    visited.add(el.id);
    descendants.push(el.id);

    getChildren(nodes, edges, el, true).forEach((v) => {
      stack.push(v);
      descendants.push(v.id);
    });
  }

  return descendants;
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

export function createCodeFromCodeRepresentation(code: CodeRepresentation) {
  const map: Map<string, string[]> = code.imports.reduce(
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
      .map(
        (k) =>
          `from ${k} import ${map.get(k)?.includes('*') ? '*' : map.get(k)!.toSorted().join(', ')}`,
      )
      .join('\n') + '\n\n';

  return import_map + code.expression;
}

export function getConstantDefinition(
  nodes: Node[],
  name: string,
): Node | undefined {
  return nodes.find(
    (v) => v.type === 'constant_definition' && v.data.name === name,
  );
}
