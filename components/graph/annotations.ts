import { StateCreator } from 'zustand';
import { StoreType } from './store';
import { Node } from '@xyflow/react';
import {
  getFunctionHandles,
  getFunctionParameterRelative,
  getHandleType,
  getNode,
} from './utils';
import { getHandleName, ITamaroFunctionCardData } from './cards/function';

export type Annotation = ErrorAnnotation;
export type ErrorAnnotation =
  | SyntaxErrorAnnotation
  | TypeErrorAnnotation
  | ValueErrorAnnotation;

export interface SyntaxErrorAnnotation {
  kind: 'syntax-error';
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

    if (node.type !== 'function') return;

    const card = node.data as unknown as ITamaroFunctionCardData;
    const function_el = card.value;

    const annotations = getFunctionHandles(function_el)
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

        const connected_type = getHandleType(connected_node, 'output');

        if (connected_type !== type) {
          setEdges(
            edges.map((edge) =>
              !(edge.target === id && edge.targetHandle === getHandleName(name))
                ? edge
                : {
                    ...edge,
                    className:
                      'invalid_type_edge ' +
                      (error_level === 'highlight' ? 'highlight_error' : ''),
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
        }

        return undefined;
      })
      .filter(Boolean)
      .map((v) => v as ErrorAnnotation);

    get().setAnnotations(
      get()
        .annotations.filter((v) => v.location.node_id !== id)
        .concat(annotations),
    );
  },
});
