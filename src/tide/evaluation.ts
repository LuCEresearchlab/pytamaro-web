import { Definitions, EvaluatedDefinition } from './language/definitions';
import {
  ConstantDefinitionNode,
  TamaroCardNode,
  TideNode,
  TideNodeMetadata,
} from '../../components/tide/cards';
import { getConstantDefinitions, getNode, getUsages } from './utils';
import { evaluate_context, evaluate_tree } from './language/evaluation';
import {
  EvaluatedTamaroCard_FunctionUse,
  NonEvaluatedTamaroCard_FunctionUse,
  TamaroCard,
} from './language/cards';

import { toFlat } from './language/utils';
import { Edge } from '@xyflow/react';
import { getDefaultContext } from '../../cypress/e2e/tide/data';

export function roots(nodes: TideNode[], edges: Edge[]) {
  const not_roots = new Set(edges.map((v) => v.source));
  return nodes.filter((v) => !not_roots.has(v.id));
}

export function evaluated_context(nodes: TideNode[], edges: Edge[]) {
  return (
    getDefaultContext() as unknown as EvaluatedDefinition<TideNodeMetadata>[]
  ).concat(
    roots(nodes, edges)
      .filter((v) => v.type === 'constant_definition')
      .map((v) => v as ConstantDefinitionNode)
      .map((v) => v.data)
      .filter((v) => v.evaluated)
      .map((v) => v as EvaluatedDefinition<TideNodeMetadata>),
  );
}

export function propagate_unevaluation(
  nodes: TideNode[],
  edges: Edge[],
  ...ids: string[]
): string[] {
  const to_uneval = new Set<string>();
  const stack: TideNode['data'][] = ids
    .map((v) => getNode(nodes, v)?.data)
    .filter((v) => v)
    .map((v) => v as TideNode['data']);

  while (stack.length !== 0) {
    const data = stack.pop()!;

    if (to_uneval.has(data.metadata.node_id)) continue;
    to_uneval.add(data.metadata.node_id);

    const successor = edges.find(
      (v) => v.source === data.metadata.node_id,
    )?.target;

    if (successor) stack.push(getNode(nodes, successor)!.data);
    if (data.kind === 'constant_definition') {
      stack.push(...getUsages(nodes, data.location.name).map((v) => v.data));
      stack.push(
        ...getConstantDefinitions(nodes, data.location.name).map((v) => v.data),
      );
    }
  }

  return Array.from(to_uneval);
}

function updateTreeInsideNodes(nodes: TideNode[]) {
  const updated_map = new Map<string, TideNode>();

  function aux(node: TideNode): TideNode {
    if (updated_map.has(node.data.metadata.node_id))
      return updated_map.get(node.data.metadata.node_id)!;
    switch (node.type) {
      case 'constant':
      case 'literal': {
        updated_map.set(node.id, node);
        return node;
      }
      case 'constant_definition': {
        const root = node.data.root
          ? getNode(nodes, node.data.root.metadata.node_id)
          : undefined;
        if (!root) {
          updated_map.set(node.id, node);
          return node;
        }

        const root_data: TamaroCard<TideNodeMetadata> | undefined = aux(root)
          ?.data as TamaroCard<TideNodeMetadata> | undefined;

        const newNode: ConstantDefinitionNode = {
          ...node,
          data: {
            ...node.data,
            root: root_data,
          } as ConstantDefinitionNode['data'],
        };
        updated_map.set(node.id, newNode);

        return newNode;
      }
      case 'function': {
        const children: Map<string, TamaroCardNode['data']> = new Map(
          node.data.children
            .entries()
            .map(([k, v]): [string, TamaroCardNode['data']] => {
              const node = getNode(nodes, v.metadata.node_id) as TamaroCardNode;
              const updated: TamaroCardNode['data'] | undefined = node
                ? (aux(node)?.data as TamaroCardNode['data'])
                : undefined;

              if (updated) return [k, updated];
              return [k, v];
            }),
        );

        const children_uneval =
          children.values().find((v) => !v.evaluated) !== undefined;

        if (node.data.evaluated && !children_uneval) {
          updated_map.set(node.id, {
            ...node,
            type: 'function',
            data: {
              ...node.data,
              evaluated: true,
              children: children,
            } as EvaluatedTamaroCard_FunctionUse<TideNodeMetadata>,
          });
        } else {
          updated_map.set(node.id, {
            ...node,
            type: 'function',
            data: {
              ...node.data,
              evaluated: false,
              children: children,
            } as NonEvaluatedTamaroCard_FunctionUse<TideNodeMetadata>,
          });
        }
        return updated_map.get(node.id)!;
      }
    }
  }

  return nodes.map((v) => aux(v));
}

export async function evaluation(
  _nodes: TideNode[],
  edges: Edge[],
): Promise<TideNode[]> {
  const nodes = updateTreeInsideNodes(_nodes);

  const nodes_context: Definitions<TideNodeMetadata> = (
    getDefaultContext() as Definitions<TideNodeMetadata>
  ).concat(
    nodes
      .filter((v) => v.data.kind === 'constant_definition')
      .map((v) => (v as ConstantDefinitionNode).data),
  );

  const context = await evaluate_context(nodes_context);

  const all_evaluated: TideNode[] = await Promise.all(
    roots(nodes, edges).map(async (v): Promise<TideNode['data']> => {
      if (v.data.kind === 'constant_definition') {
        const context_data = context
          .filter((v) => v.subkind === 'local')
          .find((def) => def.metadata.node_id === v.id);
        return { ...v.data, ...context_data } as ConstantDefinitionNode['data'];
      }
      return await evaluate_tree(
        v.data as TamaroCard<TideNodeMetadata>,
        context,
      );
    }),
  ).then((array) => {
    return array
      .map((v) => v as TideNode['data'])
      .map((v): TideNode['data'][] => {
        return v.kind === 'constant_definition'
          ? (v.root ? (toFlat(v.root) as TideNode['data'][]) : []).concat([v])
          : toFlat(v as TamaroCard<TideNodeMetadata>);
      })
      .reduce((a, b) => a.concat(b), [])
      .map((v) => {
        const node = nodes.find((node) => node.id === v.metadata.node_id)!;
        return {
          ...node,
          data: {
            ...node.data,
            ...v,
          },
        } as TideNode;
      });
  });

  return all_evaluated;
}
