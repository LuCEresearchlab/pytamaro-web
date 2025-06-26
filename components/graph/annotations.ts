import { StateCreator } from 'zustand';
import { StoreType } from './store';
import { Node } from '@xyflow/react';
import {
  getFunctionHandles,
  getFunctionParameterRelative,
  getHandleType,
} from './utils';
import { getHandleName, ITamaroFunctionCardData } from './cards/function';
import { CardType } from './cards';
import { ITamaroConstantUseCardData } from './cards/constant_use';
import { check_const_name } from './cards/constant_definition';

export type Annotation = ErrorAnnotation;
export type ErrorAnnotation =
  | SyntaxErrorAnnotation
  | TypeErrorAnnotation
  | ValueErrorAnnotation
  | NameErrorAnnotation;

export type SyntaxErrorAnnotation =
  | SyntaxErrorInvalidConstantIdentifierAnnotation
  | SyntaxErrorMissingParameterAnnotation
  | SyntaxErrorConstantHasNoValueAnnotation;

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
  | NameErrorUnknownConstantAnnotation;

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
    const { setEdges, nodes, edges, error_level } = get();
    const id = node.id;

    let annotations: ErrorAnnotation[];

    switch (node.type as CardType) {
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

            if (connected_type !== type || connected_type === 'Unknown') {
              setEdges(
                edges.map((edge) =>
                  !(
                    edge.target === id &&
                    edge.targetHandle === getHandleName(name)
                  )
                    ? edge
                    : {
                        ...edge,
                        className:
                          'invalid_type_edge ' +
                          (error_level === 'highlight'
                            ? 'highlight_error'
                            : ''),
                      },
                ),
              );

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

        const output_value = get().img_states.find(
          (v) => v.id === node.id,
        )?.code;

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

      case 'constant_definition': {
        const { name } = node.data as unknown as ITamaroConstantUseCardData;

        const output_value = get().img_states.find(
          (v) => v.id === node.id,
        )?.code;

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
  },
});
