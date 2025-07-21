import { Context, EvaluatedDefinition } from './language/context';
import {
  ConstantDefinitionNode,
  TamaroCardNode,
  TideNodeMetadata,
} from '../../components/tide/cards';
import { getConstantDefinitions, getNode, getUsages } from './utils';
import { evaluate_context, evaluate_tree } from './language/evaluation';
import {
  EvaluatedTamaroCard_FunctionUse,
  TamaroCard,
  TamaroCardParameterEnvironment,
} from './language/cards';
import { toFlat } from './language/utils';
import { Edge } from '@xyflow/react';
import { UnsoundType } from './language/expression';
import { TideSyntaxErrorConstantHasNoValue_builder } from './language/error_builders';
import { getDefaultContext } from '../../cypress/e2e/tide/data';

export function roots(nodes: TamaroCardNode[], edges: Edge[]) {
  const not_roots = new Set(edges.map((v) => v.source));
  return nodes.filter((v) => !not_roots.has(v.id));
}

export function evaluated_context(nodes: TamaroCardNode[], edges: Edge[]) {
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
  nodes: TamaroCardNode[],
  edges: Edge[],
  ...ids: string[]
): string[] {
  const to_uneval = new Set<string>();
  const stack: TamaroCardNode['data'][] = ids
    .map((v) => getNode(nodes, v)?.data)
    .filter((v) => v)
    .map((v) => v as TamaroCardNode['data']);

  while (stack.length !== 0) {
    const data = stack.pop()!;

    if (to_uneval.has(data.metadata.node_id)) continue;
    to_uneval.add(data.metadata.node_id);

    const successor = edges.find(
      (v) => v.source === data.metadata.node_id,
    )?.target;

    if (successor) stack.push(getNode(nodes, successor)!.data);
    if (data.kind === 'constant_definition') {
      stack.push(...getUsages(nodes, data.import.name).map((v) => v.data));
      stack.push(
        ...getConstantDefinitions(nodes, data.import.name).map((v) => v.data),
      );
    }
  }

  return Array.from(to_uneval);
}

function updateTreeInsideNodes(nodes: TamaroCardNode[]) {
  const updated_map = new Map<string, TamaroCardNode>();

  function aux(node: TamaroCardNode): TamaroCardNode {
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

        const root_data: TamaroCard<[], TideNodeMetadata> | undefined = aux(
          root,
        )?.data as TamaroCard<[], TideNodeMetadata> | undefined;

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
        const children: Map<
          string,
          TamaroCard<TamaroCardParameterEnvironment, TideNodeMetadata>
        > = new Map(
          node.data.children
            .entries()
            .map(
              ([k, v]): [
                string,
                TamaroCard<TamaroCardParameterEnvironment, TideNodeMetadata>,
              ] => {
                const node = getNode(nodes, v.metadata.node_id);
                const updated = node ? aux(node)?.data : undefined;
                if (updated?.kind === 'constant_definition')
                  throw new Error(
                    'Constant definition should be child of function',
                  );

                if (updated) return [k, updated];
                return [k, v];
              },
            ),
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
            } as EvaluatedTamaroCard_FunctionUse<
              TamaroCardParameterEnvironment,
              TideNodeMetadata
            >,
          });
        } else {
          updated_map.set(node.id, {
            ...node,
            type: 'function',
            data: {
              ...node.data,
              evaluated: false,
              children,
            },
          });
        }
        return updated_map.get(node.id)!;
      }
    }
  }

  return nodes.map((v) => aux(v));
}

export async function evaluation(
  _nodes: TamaroCardNode[],
  edges: Edge[],
): Promise<TamaroCardNode[]> {
  const nodes = updateTreeInsideNodes(_nodes);

  const nodes_context: Context<TideNodeMetadata> = (
    getDefaultContext() as Context<TideNodeMetadata>
  ).concat(
    nodes
      .filter((v) => v.data.kind === 'constant_definition')
      .map((v) => (v as ConstantDefinitionNode).data),
  );

  const context = await evaluate_context(nodes_context);

  const all_evaluated: TamaroCardNode[] = await Promise.all(
    roots(nodes, edges).map(async (v): Promise<TamaroCardNode['data']> => {
      if (v.data.kind === 'constant_definition') {
        if (v.data.root) {
          const eval_root = await evaluate_tree(v.data.root, context);
          return {
            ...v.data,
            evaluated: true,
            kind: 'constant_definition',
            root: eval_root,
            value: eval_root.value,
          };
        }
        return {
          ...v.data,
          evaluated: true,
          value: {
            type: UnsoundType.Bottom,
            error: TideSyntaxErrorConstantHasNoValue_builder(
              v.data.import.name,
            ),
          },
        };
      }
      return await evaluate_tree(v.data, context);
    }),
  ).then((array) => {
    return array
      .map((v) => v as TamaroCardNode['data'])
      .map((v): TamaroCardNode['data'][] => {
        return v.kind === 'constant_definition'
          ? (v.root ? (toFlat(v.root) as TamaroCardNode['data'][]) : []).concat(
              [v],
            )
          : toFlat(v);
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
        } as TamaroCardNode;
      });
  });

  return all_evaluated;
}
