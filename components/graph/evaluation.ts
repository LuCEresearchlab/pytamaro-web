import { Context, EvaluatedDefinition } from '../../src/tide/context';
import {
  ConstantDefinitionNode,
  FunctionNode,
  TamaroCardNode,
  TideNodeMetadata,
} from './cards';
import { getConstantDefinitions, getDepth, getNode, getUsages } from './utils';
import { evaluate_context, evaluate_tree } from '../../src/tide/evaluation';
import {
  EvaluatedTamaroCard,
  EvaluatedTamaroCard_FunctionUse,
  TamaroCard,
  TamaroCardParameterEnvironment,
} from '../../src/tide/cards';
import { toFlat } from '../../src/tide/utils';
import { Edge } from '@xyflow/react';
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

export function uneval(
  nodes: TamaroCardNode[],
  edges: Edge[],
  ...ids: string[]
) {
  const to_uneval = new Set();
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

  return nodes.map((v) =>
    !to_uneval.has(v.id)
      ? v
      : ({ ...v, data: { ...v.data, evaluated: false } } as TamaroCardNode),
  );
}

function updateTreeInsideNodes(nodes: TamaroCardNode[], edges: Edge[]) {
  const sorted = nodes
    .map((v): [number, TamaroCardNode] => [getDepth(v, nodes, edges), v])
    .toSorted((a, b) => a[0] - b[0])
    .map((v) => v[1])
    .toReversed();

  const leaves = sorted.filter((v) => v.type !== 'function');
  const functions = sorted
    .filter((v) => v.type === 'function')
    .map((v) => v as FunctionNode);

  const updated_map = new Map<string, TamaroCardNode>(
    leaves.map((v) => [v.id, v]),
  );

  functions.forEach((v) => {
    const children: Map<
      string,
      TamaroCard<TamaroCardParameterEnvironment, TideNodeMetadata>
    > = new Map(
      v.data.children
        .entries()
        .map(
          ([k, v]): [
            string,
            TamaroCard<TamaroCardParameterEnvironment, TideNodeMetadata>,
          ] => {
            const updated = updated_map.get(v.metadata.node_id);
            if (updated)
              return [
                k,
                updated.data as TamaroCard<
                  TamaroCardParameterEnvironment,
                  TideNodeMetadata
                >,
              ];
            return [
              k,
              v as TamaroCard<TamaroCardParameterEnvironment, TideNodeMetadata>,
            ];
          },
        ),
    );

    const children_uneval =
      children.values().find((v) => !v.evaluated) !== undefined;

    if (v.data.evaluated && !children_uneval) {
      updated_map.set(v.id, {
        ...v,
        data: {
          ...v.data,
          evaluated: true,
          children: children as unknown as Map<
            string,
            EvaluatedTamaroCard<
              TamaroCardParameterEnvironment,
              TideNodeMetadata
            >
          >,
        } as EvaluatedTamaroCard_FunctionUse<
          TamaroCardParameterEnvironment,
          TideNodeMetadata
        >,
      });
    } else {
      updated_map.set(v.id, {
        ...v,
        data: {
          ...v.data,
          evaluated: false,
          children,
        },
      });
    }
  });

  return nodes.map((v) => updated_map.get(v.id)!);
}

export async function evaluation(_nodes: TamaroCardNode[], edges: Edge[]) {
  const nodes = updateTreeInsideNodes(_nodes, edges);

  const nodes_context: Context<TideNodeMetadata> = (
    getDefaultContext() as Context<TideNodeMetadata>
  ).concat(
    nodes
      .filter((v) => v.data.kind === 'constant_definition')
      .map((v) => (v as ConstantDefinitionNode).data),
  );

  const context = await evaluate_context(nodes_context);

  const all_evaluated: TamaroCardNode['data'][] = await Promise.all(
    roots(nodes, edges).map(async (v) => {
      return await evaluate_tree(
        v.data as TamaroCard<TamaroCardParameterEnvironment, TideNodeMetadata>,
        context,
      );
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
      .reduce((a, b) => a.concat(b), []);
  });
  return all_evaluated;
}
