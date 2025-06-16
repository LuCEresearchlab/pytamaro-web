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
import { create } from 'zustand';

interface GraphState {
  dragged:
    | {
        type: string;
        data: Record<string, unknown>;
      }
    | undefined;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
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

export const useStore = create<GraphState>((set, get) => ({
  dragged: undefined,
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
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
  setEdges: (edges) => {
    set({ edges });
  },
  updateNodeData: (
    nodeId: string,
    data:
      | Record<string, unknown>
      | ((data: Record<string, unknown>) => Record<string, unknown>),
  ) => {
    const newData = typeof data === 'function' ? data : () => data;

    set({
      nodes: get().nodes.map((v) =>
        v.id === nodeId ? { ...v, data: newData(v.data) } : v,
      ),
    });
  },
}));
