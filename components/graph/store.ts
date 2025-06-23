import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from '@xyflow/react';
import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChangeSliceState, createChangeSlice } from './changes';
import { ConfigurationState, createConfigurationSlice } from './configuration';
import { createImgStateSlice, ImgStateSlice } from './img_store';
import { AnnotationStateSlice, createAnnotationSlice } from './annotations';
import { getNode } from './utils';

export interface DraggedElementData {
  type: string;
  data: Record<string, unknown>;
}

export interface GraphStateSlice {
  dragged: DraggedElementData | undefined;
  initialized: 'before' | 'wait' | 'done';
  setInitialized: (v: 'before' | 'wait' | 'done') => void;
  nodes: Node[];
  edges: Edge[];
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
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
  StoreType,
  [],
  [],
  GraphStateSlice
> = (set, get) => ({
  fullscreen: false,
  setFullscreen: (value) => {
    set({ fullscreen: value });
  },
  initialized: 'before',
  setInitialized: (v) => {
    set({ initialized: v });
  },
  dragged: undefined,
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
    const befores = get().nodes;
    set({
      nodes: applyNodeChanges(changes, befores),
    });

    changes
      .filter((v) => v.type === 'dimensions')
      .map((v) => v.id)
      .map(get().invalidate_node);

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

    changes
      .filter((v) => v.type === 'remove')
      .forEach((change) =>
        get().setAnnotations(
          get().annotations.filter((v) => v.location.node_id !== change.id),
        ),
      );

    changes
      .filter((v) => v.type === 'add')
      .map((v) => v.item)
      .forEach(get().updateAnnotation);
  },
  onEdgesChange: (changes) => {
    const befores = get().edges;

    const changed_edges = changes
      .filter((v) => v.type !== 'select' && v.type !== 'replace')
      .map((v) =>
        v.type === 'remove' ? befores.find((o) => o.id === v.id)! : v.item,
      );

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
            change.type === 'remove'
              ? undefined
              : afters.find((v) => change.item.id === v.id),
        });
      });

    changed_edges
      .map((v) => getNode(get().nodes, v.source))
      .filter(Boolean)
      .map((v) => v as Node)
      .forEach(get().updateAnnotation);

    changed_edges
      .map((v) => getNode(get().nodes, v.target))
      .filter(Boolean)
      .map((v) => v as Node)
      .forEach(get().updateAnnotation);

    // Exec after annotation because some results are cached by annotation
    changed_edges.map((v) => v.target).forEach(get().invalidate_node);
  },
  onConnect: (connection) => {
    get().onEdgesChange([
      {
        type: 'add',
        item: {
          ...connection,
          id: `${connection.source}-${connection.target}-${new Date().getTime()}`,
        },
      },
    ]);
  },
  setDragged: (
    dragged: { type: string; data: Record<string, unknown> } | undefined,
  ) => {
    set({ dragged });
  },
  setNodes: (new_nodes) => {
    const current_nodes = get().nodes;

    const changes: NodeChange[] = [];
    const newLookup = new Map<string, Node>(
      new_nodes.map((item) => [item.id, item]),
    );
    const currentLookup = new Map<string, Node>(
      current_nodes.map((item) => [item.id, item]),
    );

    for (const [index, item] of Array.from(new_nodes.entries())) {
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

    get().onNodesChange(changes);
  },
  getNodes: () => get().nodes,
  setEdges: (new_edges) => {
    const current_edges = get().edges;

    const changes: EdgeChange[] = [];
    const newLookup = new Map<string, Edge>(
      new_edges.map((item) => [item.id, item]),
    );
    const currentLookup = new Map<string, Edge>(
      current_edges.map((item) => [item.id, item]),
    );

    for (const [index, item] of Array.from(new_edges.entries())) {
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

    get().onEdgesChange(changes);
  },
  getEdges: () => get().edges,
  updateNodeData: (nodeId, data) => {
    const newData = typeof data === 'function' ? data : () => data;
    get().setNodes(
      get().nodes.map((v) =>
        v.id === nodeId ? { ...v, data: newData(v.data) } : v,
      ),
    );
  },
});

export type StoreType = ImgStateSlice &
  GraphStateSlice &
  ChangeSliceState &
  ConfigurationState &
  AnnotationStateSlice;

export const useStore = create<StoreType>()(
  persist(
    (...a) => ({
      ...createImgStateSlice(...a),
      ...createGraphSlice(...a),
      ...createChangeSlice(...a),
      ...createConfigurationSlice(...a),
      ...createAnnotationSlice(...a),
    }),
    {
      name: 'playground_graph',
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
      onRehydrateStorage() {
        return (state) => {
          if (!state) return;

          state.nodes.map((v) => v.id).forEach(state.invalidate_node);
          state.setInitialized('wait');
          return state;
        };
      },
    },
  ),
);
