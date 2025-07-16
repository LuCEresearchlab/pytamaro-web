'use client';
import { Edge, Node } from '@xyflow/react';
import { getHandleName, getParameterName } from './cards/function';
import { JudiciousFunction } from '../../src/schemas/documentation';
import {
  CardType,
  FunctionNode,
  ImportReference,
  node_types,
  TamaroCardNode,
  TideNodeMetadata,
} from './cards';
import {
  EvaluatedContext,
  EvaluatedFunctionDefinition,
} from '../../src/tide/context';
import { UnsoundType } from '../../src/tide/expression';
import { getCardOutputType } from '../../src/tide/utils';
import {
  TamaroCard,
  TamaroCardParameterEnvironment,
} from '../../src/tide/cards';

export function getNode(nodes: TamaroCardNode[], id: string) {
  return nodes.find((v) => v.id === id);
}

export function getSource(nodes: TamaroCardNode[], edge: Edge) {
  return getNode(nodes, edge.source);
}

export function getTarget(nodes: TamaroCardNode[], edge: Edge) {
  return getNode(nodes, edge.target);
}

export function getChildren(
  nodes: TamaroCardNode[],
  edges: Edge[],
  node: string | TamaroCardNode,
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
  nodes: TamaroCardNode[],
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
  nodes: TamaroCardNode[],
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
  nodes: TamaroCardNode[],
  edges: Edge[],
  id: string,
  parameter: string,
  unsafe_type: boolean = false,
) {
  return getRelative(nodes, edges, id, getHandleName(parameter), unsafe_type);
}

export function getHandleType(
  context: EvaluatedContext<TideNodeMetadata>,
  node: TamaroCardNode,
  handle: string,
) {
  if (handle === 'output')
    return getCardOutputType(
      node.data as TamaroCard<TamaroCardParameterEnvironment, unknown>,
    );

  switch (node.type as CardType) {
    case 'function': {
      const { data } = node as FunctionNode;
      const def = context.find((v) => v.import === data.import) as
        | EvaluatedFunctionDefinition<TamaroCardParameterEnvironment, unknown>
        | undefined;
      if (!def) return UnsoundType.Bottom;
      const arg_name = getParameterName(handle);
      return (
        def.parameters.find((v) => v.name === arg_name)?.type ||
        UnsoundType.Bottom
      );
    }
    case 'constant_definition':
      return UnsoundType.Bottom;

    default:
      throw new Error(
        'Unknown handle for ' +
          String(node.id) +
          ' of type ' +
          String(node.type),
      );
  }
}

export function getSubTreeFromRoot(
  nodes: TamaroCardNode[],
  edges: Edge[],
  root: TamaroCardNode | string,
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

export function getAmountOfExpectConnections(node: TamaroCardNode) {
  if (!node.type) return 'Unknown';

  const type = node.type;

  if (!Object.keys(node_types).includes(type)) return 'Unknown';

  switch (node.type as CardType) {
    case 'function': {
      const data = (node as FunctionNode).data;
      return data.children.size + 1;
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

export function getConstantDefinition(
  nodes: TamaroCardNode[],
  name: string,
): TamaroCardNode | undefined {
  return nodes.find(
    (v) => v.type === 'constant_definition' && v.data.import.name === name,
  );
}

export function getConstantDefinitions(
  nodes: TamaroCardNode[],
  name: string,
): TamaroCardNode[] {
  return nodes.filter(
    (v) => v.type === 'constant_definition' && v.data.import.name === name,
  );
}

export function getUsages(
  nodes: TamaroCardNode[],
  name: string,
): TamaroCardNode[] {
  return nodes.filter(
    (v) => v.type === 'constant_use' && v.data.import.name === name,
  );
}

export function getAscendants(edges: Edge[], source: string): string[] {
  let last = edges.find((v) => v.source === source);
  if (!last) return [];
  const edge_ids: string[] = [last.id];

  while (last) {
    last = edges.find((v) => v.source === last?.target);
    if (!last) return [];
    edge_ids.push(last.id);
  }

  return edge_ids;
}

export function arcToEdges(
  nodes: TamaroCardNode[],
  edges: Edge[],
  source: string,
  target: string,
): Edge[] | undefined {
  function inline_search(
    source: string,
    target: string,
    blacklist: string[] = [],
  ): string[] | undefined {
    let last: { source: string; target: string; id: string } | undefined = {
      source: source,
      target: source,
      id: '',
    };
    const edge_ids: string[] = [];

    while (last && last.target !== target) {
      if (blacklist.includes(last!.id)) {
        return undefined;
      }
      if (last.id !== '') edge_ids.push(last.id);
      const last_node = getNode(nodes, last.target);
      if (last_node?.type === 'constant_definition') {
        const usages = getUsages(nodes, last_node.data.import.name as string);

        const good_usage = usages.find((v) =>
          inline_search(v.id, target, edge_ids.concat(blacklist)),
        );

        if (!good_usage) return undefined;
        edge_ids.push(...inline_search(good_usage.id, target, edge_ids)!);
        return edge_ids;
      }
      last = edges.find((v) => v.source === last?.target);
    }
    if (!last) return undefined;
    edge_ids.push(last.id);
    return edge_ids;
  }

  const dir1 = inline_search(source, target);

  const edges_ids = dir1 ? dir1 : inline_search(target, source);
  if (!edges_ids) return undefined;
  return edges.filter((v) => edges_ids.includes(v.id));
}

export function getSubTreeFromRootConsideringConstants(
  nodes: TamaroCardNode[],
  edges: Edge[],
  root: TamaroCardNode | string,
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
    });

    if (el.type === 'constant_use') {
      const definitions = getConstantDefinitions(
        nodes,
        el.data.import.name as string,
      );
      if (definitions.length !== 1) continue;

      const d = definitions[0];
      stack.push(d);
    }
  }

  return descendants;
}

export function toEnglishName(name: string): string | undefined {
  const obj = {
    Graphic: {
      en: 'Graphic',
      it: 'Grafica',
      de: 'Grafik',
      fr: 'Graphique',
    },
    Color: {
      en: 'Color',
      it: 'Colore',
      de: 'Farbe',
      fr: 'Couleur',
    },
    Point: {
      en: 'Point',
      it: 'Punto',
      de: 'Punkt',
      fr: 'Point',
    },
    float: {
      _: 'float',
      _2: 'int',
    },
    str: {
      _: 'str',
    },
  };

  return Object.entries(obj).find((v) =>
    Object.values(v[1]).includes(name),
  )?.[0] as string | undefined;
}
