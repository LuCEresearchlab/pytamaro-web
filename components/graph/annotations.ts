import { StateCreator } from 'zustand';
import { StoreType } from './store';
import { Node } from '@xyflow/react';
import {
  arcToEdges,
  getConstantDefinition,
  getFunctionHandles,
  getFunctionParameterRelative,
  getHandleType,
  getNode,
  getSubTreeFromRoot,
  getSubTreeFromRootConsideringConstants,
} from './utils';
import {
  getHandleName,
  getParameterName,
  ITamaroFunctionCardData,
} from './cards/function';
import { CardType } from './cards';
import { ITamaroConstantUseCardData } from './cards/constant_use';
import { check_const_name } from './cards/constant_definition';
import { ITamaroLiteralCardData } from './cards/literal';

export type Annotation = ErrorAnnotation;
export type ErrorAnnotation =
  | SyntaxErrorAnnotation
  | TypeErrorAnnotation
  | ValueErrorAnnotation
  | NameErrorAnnotation;

export type SyntaxErrorAnnotation =
  | SyntaxErrorInvalidConstantIdentifierAnnotation
  | SyntaxErrorMissingParameterAnnotation
  | SyntaxErrorConstantHasNoValueAnnotation
  | SyntaxErrorInvalidLiteralAnnotation;

export interface SyntaxErrorInvalidConstantIdentifierAnnotation {
  kind: 'syntax-error';
  subkind: 'invalid_constant_identifier';
  location: {
    node_id: string;
    handle: undefined;
    position: undefined;
  };
  args: [{ name: 'name'; value: string }];
}

export interface SyntaxErrorInvalidLiteralAnnotation {
  kind: 'syntax-error';
  subkind: 'invalid_literal';
  location: {
    node_id: string;
    handle: undefined;
    position: undefined;
  };
  args: [{ name: 'value'; value: string }];
}

export interface SyntaxErrorConstantHasNoValueAnnotation {
  kind: 'syntax-error';
  subkind: 'constant_has_no_value';
  location: {
    node_id: string;
    handle: undefined;
    position: undefined;
  };
  args: [{ name: 'name'; value: string }];
}

export interface SyntaxErrorMissingParameterAnnotation {
  kind: 'syntax-error';
  subkind: 'missing_parameter';
  location: {
    node_id: string;
    handle: string;
    position: 'target';
  };
  args: [{ name: 'name'; value: string }];
}

export interface TypeErrorAnnotation {
  kind: 'type-error';
  location: {
    handle: string;
    node_id: string;
    position: 'target';
  };
  args: [{ name: 'expected'; value: string }, { name: 'got'; value: string }];
}

export type NameErrorAnnotation =
  | NameErrorMultipleConstantDefinitionAnnotation
  | NameErrorUnknownConstantAnnotation
  | NameErrorCyclicalDependenciesAnnotation;

export interface NameErrorUnknownConstantAnnotation {
  kind: 'name-error';
  subkind: 'unknown_constant';
  location: {
    handle: undefined;
    node_id: string;
    position: undefined;
  };
  args: [{ name: 'name'; value: string }];
}

export interface NameErrorMultipleConstantDefinitionAnnotation {
  kind: 'name-error';
  subkind: 'multiple_definitions';
  location: {
    handle: undefined;
    node_id: string;
    position: undefined;
  };
  args: [{ name: 'name'; value: string }];
}

export interface NameErrorCyclicalDependenciesAnnotation {
  kind: 'name-error';
  subkind: 'cyclical_dependencies';
  location: {
    handle: undefined;
    node_id: string;
    position: undefined;
  };
  args: [{ name: 'names'; value: string }];
}

export interface ValueErrorAnnotation {
  kind: 'value-error';
  location: {
    node_id: string;
    handle: string;
    position: 'middle';
  };
  args: [{ name: 'name'; value: string }];
}

export interface AnnotationStateSlice {
  annotations: Annotation[];

  setAnnotations: (annotations: Annotation[]) => void;
  getAnnotations: () => Annotation[];

  updateAnnotation: (node: Node) => void;
}

export const createAnnotationSlice: StateCreator<
  StoreType,
  [],
  [],
  AnnotationStateSlice
> = (set, get) => ({
  annotations: [],

  setAnnotations(annotations) {
    set({ annotations });
  },

  getAnnotations() {
    return get().annotations;
  },

  updateAnnotation(node) {
    if (!node) return;
    const { setEdges, getEdges, nodes, edges, setNodes, getNodes } = get();
    const id = node.id;

    let annotations: ErrorAnnotation[];

    const GENERIC_MAIN_CLASS_NAME = 'error-main-highlight';
    const GENERIC_SND_CLASS_NAME = 'error-secondary-highlight';

    switch (node.type as CardType) {
      case 'literal': {
        const card = node.data as unknown as ITamaroLiteralCardData;
        if (card.literal_type == null) {
          annotations = [
            {
              kind: 'syntax-error',
              subkind: 'invalid_literal',
              location: {
                node_id: node.id,
                handle: undefined,
                position: undefined,
              },
              args: [
                {
                  name: 'value',
                  value: card.value,
                },
              ],
            },
          ];
        } else annotations = [];
        break;
      }

      case 'function': {
        const card = node.data as unknown as ITamaroFunctionCardData;
        const function_el = card.value;
        annotations = getFunctionHandles(function_el)
          .map(({ name, type }): ErrorAnnotation | undefined => {
            const connected_node = getFunctionParameterRelative(
              nodes,
              edges,
              id,
              name,
              true,
            );

            if (!connected_node)
              return {
                kind: 'syntax-error',
                subkind: 'missing_parameter',
                args: [
                  {
                    name: 'name',
                    value: name,
                  },
                ],
                location: {
                  handle: name,
                  node_id: id,
                  position: 'target',
                },
              };

            const connected_type = getHandleType(
              nodes,
              connected_node,
              'output',
            );

            if (
              connected_type !== type &&
              connected_type !== 'Unknown' &&
              type !== 'Unknown'
            ) {
              return {
                kind: 'type-error',
                args: [
                  {
                    name: 'expected',
                    value: type,
                  },
                  {
                    name: 'got',
                    value: connected_type,
                  },
                ],
                location: {
                  handle: name,
                  node_id: id,
                  position: 'target',
                },
              };
            } else
              setEdges(
                edges.map((edge) =>
                  !(
                    edge.target === id &&
                    edge.targetHandle === getHandleName(name)
                  )
                    ? edge
                    : {
                        ...edge,
                        className: '',
                      },
                ),
              );

            return undefined;
          })
          .filter(Boolean)
          .map((v) => v as ErrorAnnotation);

        break;
      }
      case 'constant_use': {
        const { name } = node.data as unknown as ITamaroConstantUseCardData;

        const definitions = nodes.filter(
          (v) => v.type === 'constant_definition' && v.data.name === name,
        );

        if (!check_const_name(name)) {
          annotations = [
            {
              kind: 'syntax-error',
              subkind: 'invalid_constant_identifier',
              args: [{ name: 'name', value: name }],
              location: {
                handle: undefined,
                node_id: node.id,
                position: undefined,
              },
            },
          ];
        } else if (definitions.length === 0) {
          annotations = [
            {
              kind: 'name-error',
              subkind: 'unknown_constant',
              args: [
                {
                  name: 'name',
                  value: name,
                },
              ],
              location: {
                handle: undefined,
                position: undefined,
                node_id: node.id,
              },
            },
          ];
        } else {
          annotations = [];
        }
        break;
      }

      case 'constant_definition': {
        const { name } = node.data as unknown as ITamaroConstantUseCardData;

        const output_value = get().img_states.find(
          (v) => v.id === node.id,
        )?.code;

        const definitions = nodes.filter(
          (v) => v.type === 'constant_definition' && v.data.name === name,
        );

        const stack: string[][] = [[node.id]];

        let result: string[] | undefined = undefined;
        while (stack.length !== 0) {
          const current_dependecy_edge = stack.pop()!;
          const el = current_dependecy_edge[0];
          if (current_dependecy_edge.includes(el, 1)) {
            result = current_dependecy_edge
              .map((v) => getNode(nodes, v))
              .map((v) => (v?.data.name || '') as string);
            break;
          }

          const dependsOn = Array.from(
            new Set(
              getSubTreeFromRoot(nodes, edges, el)
                .map((v) => getNode(nodes, v))
                .filter((v) => v?.type === 'constant_use')
                .map((v) => v?.data?.name as string | undefined)
                .filter((v) => v)
                .map((v) => v as string)
                .map((v) => getConstantDefinition(nodes, v))
                .filter((v) => v)
                .map((v) => v!.id),
            ),
          );

          stack.push(...dependsOn.map((o) => [o, ...current_dependecy_edge]));
        }

        if (!check_const_name(name)) {
          annotations = [
            {
              kind: 'syntax-error',
              subkind: 'invalid_constant_identifier',
              args: [{ name: 'name', value: name }],
              location: {
                handle: undefined,
                node_id: node.id,
                position: undefined,
              },
            },
          ];
        } else if (definitions.length > 1) {
          annotations = [
            {
              kind: 'name-error',
              subkind: 'multiple_definitions',
              args: [
                {
                  name: 'name',
                  value: name,
                },
              ],
              location: {
                handle: undefined,
                position: undefined,
                node_id: node.id,
              },
            },
          ];
        } else if (result) {
          annotations = [
            {
              kind: 'name-error',
              subkind: 'cyclical_dependencies',
              args: [
                {
                  name: 'names',
                  value: result
                    .map((v) => '*' + v + '*')
                    .toReversed()
                    .join(' -> '),
                },
              ],
              location: {
                handle: undefined,
                node_id: id,
                position: undefined,
              },
            },
          ];
        } else if (output_value == null) {
          annotations = [
            {
              kind: 'syntax-error',
              subkind: 'constant_has_no_value',
              args: [{ name: 'name', value: name }],
              location: {
                handle: undefined,
                node_id: node.id,
                position: undefined,
              },
            },
          ];
        } else {
          annotations = [];
        }
        break;
      }
      default:
        return;
    }

    get().setAnnotations(
      get()
        .annotations.filter((v) => v.location.node_id !== id)
        .concat(annotations),
    );

    const now_annotations = get().annotations.map((v) => v.location.node_id);

    const subtree_nodes = getSubTreeFromRootConsideringConstants(
      getNodes(),
      getEdges(),
      id,
    );

    const subtree_errors = subtree_nodes.filter((o) =>
      now_annotations.includes(o),
    );

    const subtree_edges = get()
      .edges.filter((v) => subtree_nodes.includes(v.target))
      .map((v) => v.id);

    const subtree_error_edges: Set<string> = new Set<string>();

    subtree_errors
      .map((v) => arcToEdges(nodes, edges, v, id) || [])
      .reduce((a, b) => a.concat(b), [])
      .forEach((v) => subtree_error_edges.add(v.id));

    setNodes(
      getNodes().map((v) =>
        v.id !== id
          ? v
          : {
              ...v,
              className: (
                (v.className || '')
                  .replace(GENERIC_MAIN_CLASS_NAME, '')
                  .replace(GENERIC_SND_CLASS_NAME, '') +
                (annotations.length !== 0
                  ? ' ' + GENERIC_MAIN_CLASS_NAME
                  : subtree_errors.length !== 0
                    ? ' ' + GENERIC_SND_CLASS_NAME
                    : '')
              ).trim(),
            },
      ),
    );

    const now_edges_annotations = get()
      .annotations.filter((v) => v.location.handle !== undefined)
      .map(
        (anno) =>
          getEdges().find(
            (v) =>
              (v.target === anno.location.node_id &&
                getParameterName(v.targetHandle || '') ===
                  anno.location.handle) ||
              (v.source === anno.location.node_id &&
                getParameterName(v.sourceHandle || '') ===
                  anno.location.handle),
          )?.id,
      )
      .filter((v) => v)
      .map((v) => v as string);

    setEdges(
      getEdges().map((v) =>
        !subtree_edges.includes(v.id)
          ? v
          : {
              ...v,
              className: (
                (v.className || '')
                  .replace(GENERIC_MAIN_CLASS_NAME, '')
                  .replace(GENERIC_SND_CLASS_NAME, '') +
                (subtree_error_edges.has(v.id)
                  ? ' ' + GENERIC_SND_CLASS_NAME
                  : '') +
                (now_edges_annotations.includes(v.id)
                  ? ' ' + GENERIC_MAIN_CLASS_NAME
                  : '')
              ).trim(),
            },
      ),
    );
  },
});
