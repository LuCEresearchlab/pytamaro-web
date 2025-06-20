import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  Node,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from '@xyflow/react';
import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChangeSliceState, createChangeSlice } from './changes';
import { createErrorSlice, ErrorStateSlice } from './errors';
import { ConfigurationState, createConfigurationSlice } from './configuration';

export interface DraggedElementData {
  type: string;
  data: Record<string, unknown>;
}

export interface GraphStateSlice {
  dragged: DraggedElementData | undefined;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  getNodes: () => Node[];
  getEdges: () => Edge[];
  setDragged: (
    dragged: { type: string; data: Record<string, unknown> } | undefined,
  ) => void;
  updateNodeData: (
    nodeId: string,
    data:
      | Record<string, unknown>
      | ((data: Record<string, unknown>) => Record<string, unknown>),
  ) => void;
}

export const createGraphSlice: StateCreator<
  GraphStateSlice & ChangeSliceState & ErrorStateSlice & ConfigurationState,
  [],
  [],
  GraphStateSlice
> = (set, get) => ({
  dragged: undefined,
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
    const befores = get().nodes;
    set({
      nodes: applyNodeChanges(changes, befores),
    });

    const afters = get().nodes;

    changes
      .filter((v) => v.type != 'select')
      .forEach((change) => {
        get().newChange({
          kind: 'node',
          native: change,
          before:
            change.type === 'add'
              ? undefined
              : befores.find((v) => change.id === v.id),

          after:
            change.type === 'add'
              ? undefined
              : afters.find((v) => change.id === v.id),
        });
      });
  },
  onEdgesChange: (changes) => {
    const befores = get().edges;
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    const afters = get().edges;

    changes
      .filter((v) => v.type != 'select')
      .forEach((change) => {
        get().newChange({
          kind: 'edge',
          native: change,
          before:
            change.type === 'add'
              ? undefined
              : befores.find((v) => change.id === v.id),
          after:
            change.type === 'add'
              ? undefined
              : afters.find((v) => change.id === v.id),
        });
      });
  },
  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));

    get().newChange({
      kind: 'edge',
      before: undefined,
      after: get().edges.find(
        (v) =>
          v.source === connection.source &&
          v.sourceHandle === connection.sourceHandle &&
          v.target === connection.target &&
          v.targetHandle === connection.targetHandle,
      ),
      native: connection,
    });
  },
  setDragged: (
    dragged: { type: string; data: Record<string, unknown> } | undefined,
  ) => {
    set({ dragged });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  getNodes: () => get().nodes,
  setEdges: (edges) => {
    set({ edges });
  },
  getEdges: () => get().edges,
  updateNodeData: (nodeId, data) => {
    const newData = typeof data === 'function' ? data : () => data;

    set({
      nodes: get().nodes.map((v) =>
        v.id === nodeId ? { ...v, data: newData(v.data) } : v,
      ),
    });
  },
});

export type StoreType = GraphStateSlice &
  ChangeSliceState &
  ErrorStateSlice &
  ConfigurationState;

export const useStore = create<StoreType>()(
  persist(
    (...a) => ({
      ...createGraphSlice(...a),
      ...createChangeSlice(...a),
      ...createErrorSlice(...a),
      ...createConfigurationSlice(...a),
    }),
    {
      name: 'playground_graph',
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    },
  ),
);
