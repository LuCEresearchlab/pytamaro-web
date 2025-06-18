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
import { executeOnServer } from '../../src/useActivity';
import { ExecutionResponse } from '../../src/codeExecution';

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
      .map((v) => [v.targetHandle || '', getNode(nodes, v.source)!]),
  );
}

export function getParents(nodes: Node[], edges: Edge[], node: string | Node) {
  const node_id = typeof node === 'string' ? node : node.id;

  return new Map(
    edges
      .filter((v) => v.source === node_id)
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
  node: Node & { data: ITamaroCardData },
  visited?: Set<string>,
): CodeRepresentation {
  if (!node?.type) return [undefined, []];
  visited?.add(node.id);

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getFunctionParameterRelative(nodes, edges, node.id, v.name)! as any,
            visited,
          ),
        );

      const expression = params.find((v) => v[0] == null)
        ? undefined
        : `${fn.name}(${params.map((v) => v[0]).join(',')})`;

      const imports = params
        .map((v) => v[1])
        .reduce((a, b) => a.concat(b), [])
        .concat({ module: data.module, name: data.name });

      // eslint-disable-next-line no-param-reassign
      node.data.representation = [expression, imports];
      break;
    }
    case 'literal': {
      const data = node.data as unknown as ITamaroLiteralCardData;
      const expression = String(data.value || 0);
      // eslint-disable-next-line no-param-reassign
      node.data.representation = [expression, []];
      break;
    }
    case 'constant': {
      const data = node.data as unknown as ITamaroConstantCardData;

      const expression = data.name;
      const imports = [{ module: data.module, name: data.name }];
      // eslint-disable-next-line no-param-reassign
      node.data.representation = [expression, imports];
      break;
    }
  }

  return node.data.representation!;
}

export async function getNodeScale(code: CodeRepresentation) {
  const newCode: CodeRepresentation = [
    `value = ${code[0]}

print(graphic_width(value))
print(graphic_height(value))`,
    code[1].concat(
      { module: 'pytamaro', name: 'graphic_width' },
      { module: 'pytamaro', name: 'graphic_height' },
    ),
  ];

  let response: ExecutionResponse | undefined;
  try {
    response = await executeOnServer(
      [createCodeFromCodeRepresentation(newCode)],
      0,
      [],
      [],
    );
  } catch {
    response = undefined;
  }
  const lines =
    response?.type === 'success'
      ? response.stdout
          .trim()
          .split('\n')
          .map((v_1) => v_1.trim())
      : undefined;
  if (lines?.length === 2) {
    return [Number.parseFloat(lines[0]), Number.parseFloat(lines[1])];
  } else return undefined;
}

export function getRootFromChild(
  nodes: Node[],
  edges: Edge[],
  node: Node,
  valid_code: boolean = true,
) {
  const parents = getParents(nodes, edges, node);
  if (parents.size !== 1) return node;

  const parent = parents.values().next().value!;
  const code = valid_code ? turnTreeToCode(nodes, edges, parent) : ['', []];
  if (code[0] == null) return node;
  return getRootFromChild(nodes, edges, parent, valid_code);
}

export function getScale(
  nodes: Node[],
  edges: Edge[],
  node: Node,
): Promise<number[] | undefined> {
  const root = getRootFromChild(nodes, edges, node);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root_code = turnTreeToExpressionRec(nodes, edges, root as any);
  return getNodeScale(root_code);
}

export async function getScaled(
  nodes: Node[],
  edges: Edge[],
  node: Node,
  code: CodeRepresentation,
): Promise<CodeRepresentation> {
  const scale = await getScale(nodes, edges, node);
  if (!scale) return code;

  const [width, height] = scale;

  return [
    `overlay(${code[0]}, rectangle(${width}, ${height}, transparent))`,
    code[1].concat(
      {
        module: 'pytamaro',
        name: 'overlay',
      },
      {
        module: 'pytamaro',
        name: 'rectangle',
      },
      {
        module: 'pytamaro',
        name: 'transparent',
      },
    ),
  ];
}

export function reassignExpression(nodes: Node[], edges: Edge[]) {
  const visited = new Set<string>();

  nodes.forEach((v) => {
    if (visited.has(v.id)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    turnTreeToExpressionRec(nodes, edges, v as any, visited);
  });
}

export function createCodeFromCodeRepresentation(code: CodeRepresentation) {
  const map: Map<string, string[]> = code[1].reduce(
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

  return import_map + code[0];
}

export function turnTreeToCode(
  nodes: Node[],
  edges: Edge[],
  node: Node,
): CodeRepresentation {
  const visited = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = turnTreeToExpressionRec(nodes, edges, node as any, visited);
  return result;
}
