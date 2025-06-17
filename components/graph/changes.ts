import { Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';
import { StateCreator } from 'zustand';
import { GraphStateSlice } from './store';

type FlowChange = NodeFlowChange | EdgeFlowChange;

interface NodeFlowChange {
  kind: 'node';
  native: NodeChange;
  before?: Node;
  after?: Node;
}

interface EdgeFlowChange {
  kind: 'edge';
  native: EdgeChange;
  before?: Edge;
  after?: Edge;
}

const MAX_STACK_SIZE = 50;

export interface ChangeSliceState {
  newChange: (change: FlowChange) => void;
  revertLastChange: () => void;
  redoChange: () => void;

  stack: FlowChange[];
  index: number;
}

export const createChangeSlice: StateCreator<
  ChangeSliceState & GraphStateSlice,
  [],
  [],
  ChangeSliceState
> = (set, get) => ({
  newChange(change) {
    const state = get();
    const stack = state.stack;
    const index = state.index;

    const redo_revert_stack = stack.filter((_, i) => i < index); // If you revert changes and write a new one we clear all the "future" changes

    if (change.kind === 'node' && change.native.type === 'position') {
      const last = redo_revert_stack.pop();
      if (
        last &&
        last.kind === 'node' &&
        last.native.type === 'position' &&
        last.native.dragging
      ) {
        change.before = last.before; // Fuse movement if still dragging
      } else if (last) redo_revert_stack.push(last);
    }
    const newlength = redo_revert_stack.push(change);
    const trimmed_stack = redo_revert_stack.filter(
      (_, i) => newlength - i - 1 < MAX_STACK_SIZE,
    );

    set({ stack: trimmed_stack, index: trimmed_stack.length });
  },
  revertLastChange() {
    const state = get();
    const stack = state.stack;
    const index = state.index;
    if (index === 0) return;
    const unsafe_change = stack[index - 1];

    switch (unsafe_change.kind) {
      case 'node': {
        const change = unsafe_change as NodeFlowChange;
        const nodes = state.nodes;
        set({
          index: index - 1,
          nodes: nodes
            .filter((v) => v.id !== change.after?.id)
            .concat([change.before].filter((v) => v).map((v) => v!)),
        });
        break;
      }
      case 'edge': {
        const change = unsafe_change as EdgeFlowChange;
        const edges = state.edges;
        set({
          index: index - 1,
          edges: edges
            .filter((v) => v.id !== change.after?.id)
            .concat([change.before].filter((v) => v).map((v) => v!)),
        });
        break;
      }
    }
  },
  redoChange() {
    const state = get();
    const stack = state.stack;
    const index = state.index;

    if (index === stack.length) return;
    const unsafe_change = stack[index];

    switch (unsafe_change.kind) {
      case 'node': {
        const change = unsafe_change as NodeFlowChange;
        const nodes = state.nodes;
        set({
          index: index + 1,
          nodes: nodes
            .filter((v) => v.id !== change.before?.id)
            .concat([change.after].filter((v) => v).map((v) => v!)),
        });
        break;
      }
      case 'edge': {
        const change = unsafe_change as EdgeFlowChange;
        const edges = state.edges;
        set({
          index: index + 1,
          edges: edges
            .filter((v) => v.id !== change.before?.id)
            .concat([change.after].filter((v) => v).map((v) => v!)),
        });
        break;
      }
    }
  },

  stack: [],
  index: 0,
});
