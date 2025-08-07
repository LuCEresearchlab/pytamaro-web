'use client';
import { Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';
import {
  getHandleName,
  getParameterName,
} from '../../components/tide/cards/function';
import { JudiciousFunction } from '../schemas/documentation';
import {
  CardType,
  FunctionNode,
  ImportReference,
  TideNode,
} from '../../components/tide/cards';
import { Definition } from './language/definitions';
import { SoundType, UnsoundType } from './language/typing';

export function getNode(nodes: TideNode[], id: string) {
  return nodes.find((v) => v.id === id);
}

export function getSource(nodes: TideNode[], edge: Edge) {
  return getNode(nodes, edge.source);
}

export function getTarget(nodes: TideNode[], edge: Edge) {
  return getNode(nodes, edge.target);
}

export function getChildren(
  nodes: TideNode[],
  edges: Edge[],
  node: string | TideNode,
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
  nodes: TideNode[],
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
  nodes: TideNode[],
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
  nodes: TideNode[],
  edges: Edge[],
  id: string,
  parameter: string,
  unsafe_type: boolean = false,
) {
  return getRelative(nodes, edges, id, getHandleName(parameter), unsafe_type);
}

export function getHandleType(
  definitions: Definition<unknown, unknown, unknown, 'constructed'>[],
  node: TideNode,
  handle: string,
) {
  if (handle === 'output')
    if ('type' in node.data && typeof node.data.type === 'number') {
      return node.data.type as SoundType;
    } else return UnsoundType.Bottom;

  switch (node.type as CardType) {
    case 'function': {
      const { data } = node as FunctionNode;
      const def = definitions.find((v) => v.location.name === data.input);
      if (!def || def.kind !== 'function_definition') return UnsoundType.Bottom;
      const arg_name = getParameterName(handle);
      const param = def.parameters.find((v) => v.name === arg_name);
      return param ? param.type : UnsoundType.Bottom;
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
  nodes: TideNode[],
  edges: Edge[],
  root: TideNode | string,
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

export const TRANSPARENT_IMPORT: ImportReference = {
  module: 'pytamaro',
  name: 'transparent',
};

export function getConstantDefinition(
  nodes: TideNode[],
  name: string,
): TideNode | undefined {
  return nodes.find(
    (v) => v.type === 'constant_definition' && v.data.input === name,
  );
}

export function getConstantDefinitions(
  nodes: TideNode[],
  name: string,
): TideNode[] {
  return nodes.filter(
    (v) => v.type === 'constant_definition' && v.data.input === name,
  );
}

export function getUsages(nodes: TideNode[], name: string): TideNode[] {
  return nodes.filter((v) => v.type === 'constant' && v.data.input === name);
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
  nodes: TideNode[],
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
        const usages = getUsages(nodes, last_node.data.input as string);

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
  nodes: TideNode[],
  edges: Edge[],
  root: TideNode | string,
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

    if (el.type === 'constant') {
      const definitions = getConstantDefinitions(
        nodes,
        el.data.input as string,
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

export function compute_node_change(before: TideNode[], after: TideNode[]) {
  const changes: NodeChange<TideNode>[] = [];
  const newLookup = new Map<string, TideNode>(
    after.map((item) => [item.id, item]),
  );
  const currentLookup = new Map<string, TideNode>(
    before.map((item) => [item.id, item]),
  );

  for (const [index, item] of Array.from(after.entries())) {
    const lookupItem = currentLookup.get(item.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storeItem = (lookupItem as any)?.internals?.userNode ?? lookupItem;

    if (storeItem !== undefined && storeItem !== item) {
      changes.push({ id: item.id, item: item, type: 'replace' });
    }

    if (storeItem === undefined) {
      changes.push({ item: item, type: 'add', index });
    }
  }

  for (const [id] of Array.from(currentLookup)) {
    const nextNode = newLookup.get(id);

    if (nextNode === undefined) {
      changes.push({ id, type: 'remove' });
    }
  }

  return changes;
}

export function compute_edge_change(befores: Edge[], after: Edge[]) {
  const changes: EdgeChange[] = [];
  const newLookup = new Map<string, Edge>(after.map((item) => [item.id, item]));
  const currentLookup = new Map<string, Edge>(
    befores.map((item) => [item.id, item]),
  );

  for (const [index, item] of Array.from(after.entries())) {
    const lookupItem = currentLookup.get(item.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storeItem = (lookupItem as any)?.internals?.userNode ?? lookupItem;

    if (storeItem !== undefined && storeItem !== item) {
      changes.push({ id: item.id, item: item, type: 'replace' });
    }

    if (storeItem === undefined) {
      changes.push({ item: item, type: 'add', index });
    }
  }

  for (const [id] of Array.from(currentLookup)) {
    const nextNode = newLookup.get(id);

    if (nextNode === undefined) {
      changes.push({ id, type: 'remove' });
    }
  }

  return changes;
}

export function getDepth(
  node: TideNode,
  nodes: TideNode[],
  edges: Edge[],
): number {
  const successor = edges.find((v) => v.source === node.id);
  if (!successor) return 0;

  return 1 + getDepth(getNode(nodes, successor.target)!, nodes, edges);
}

export function getNodeDiv(node: string): HTMLDivElement | undefined {
  return typeof window !== 'undefined'
    ? (Array.from(document.getElementsByClassName('react-flow__node')).find(
        (v) => {
          return v && v.getAttribute('data-id') === node;
        },
      ) as HTMLDivElement | undefined)
    : undefined;
}

export function getHandleDiv(
  node: string,
  handle: string,
): HTMLDivElement | undefined {
  const element = getNodeDiv(node);
  if (element)
    return Array.from(
      element.getElementsByClassName('react-flow__handle'),
    ).find((v) => v && v.getAttribute('data-handleid') === handle) as
      | HTMLDivElement
      | undefined;
  return undefined;
}
