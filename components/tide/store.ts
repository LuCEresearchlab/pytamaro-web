import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  NodeChange,
  NodePositionChange,
  NodeReplaceChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  XYPosition,
} from '@xyflow/react';
import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChangeSliceState, createChangeSlice } from '../../src/tide/changes';
import { ConfigurationState, createConfigurationSlice } from './configuration';
import {
  compute_node_change,
  getChildren,
  getNode,
  getSubTreeFromRoot,
} from '../../src/tide/utils';
import { updateParent } from '../../src/tide/graph_toolbox';
import {
  ConstantDefinitionNode,
  TamaroCardNode,
  TideNodeMetadata,
} from './cards';
import { evaluation, uneval } from '../../src/tide/evaluation';
import {
  EvaluatedConstantDefinition,
  EvaluatedContext,
} from '../../src/tide/language/context';
import { getDefaultContext } from '../../cypress/e2e/tide/data';
import { eqCard } from '../../src/tide/language/utils';
import { getParameterName } from './cards/function';
import { TamaroCard } from '../../src/tide/language/cards';

export interface DraggedElementData {
  type: string;
  data: TamaroCardNode['data'];
}

let evaluation_timeout: NodeJS.Timeout | undefined = undefined;
export interface GraphStateSlice {
  dragged: DraggedElementData | undefined;
  initialized: 'before' | 'wait' | 'done';
  setInitialized: (v: 'before' | 'wait' | 'done') => void;
  evaluated_context: () => EvaluatedContext<TideNodeMetadata>;
  nodes: TamaroCardNode[];
  edges: Edge[];
  mousePosition: XYPosition;
  reserved_names: string[];
  setReservedNames: (v: string[]) => void;
  setMousePosition: (v: XYPosition) => void;
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
  onNodesChange: OnNodesChange<TamaroCardNode>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;
  setNodes: (nodes: TamaroCardNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  getNodes: () => TamaroCardNode[];
  getEdges: () => Edge[];
  setDragged: (
    dragged: { type: string; data: TamaroCardNode['data'] } | undefined,
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
  reserved_names: [],
  setReservedNames: (v) => set({ reserved_names: v }),
  initialized: 'before',
  setInitialized: (v) => {
    set({ initialized: v });
  },
  dragged: undefined,
  nodes: [],
  edges: [],
  mousePosition: { x: 0, y: 0 },
  setMousePosition: (v) => set({ mousePosition: v }),
  evaluated_context: () => {
    return (
      getDefaultContext() as unknown as EvaluatedConstantDefinition<TideNodeMetadata>[]
    ).concat(
      get()
        .nodes.filter(
          (v) => v.data.kind === 'constant_definition' && v.data.evaluated,
        )
        .map((v) => v.data as EvaluatedConstantDefinition<TideNodeMetadata>),
    );
  },
  onNodesChange: (raw_changes) => {
    const { nodes: befores, edges } = get();

    const after = applyNodeChanges(raw_changes, befores);

    const previous_uneval = after
      .filter((v) => !v.data.evaluated)
      .map((v) => v.id);
    const initial_uneval = raw_changes
      .map((v) => {
        switch (v.type) {
          case 'remove':
            return v.id;
          case 'replace': {
            const id = v.id;
            const before = getNode(befores, id)!;
            const after = v.item;

            if (
              before.data.kind !== 'constant_definition' &&
              after.data.kind !== 'constant_definition'
            )
              if (
                before.data.kind === 'function_use' ||
                !eqCard(before.data, after.data)
              )
                return id;
            if (JSON.stringify(before.data) !== JSON.stringify(after.data))
              return id;
            break;
          }
          case 'add':
            return v.item.id;
        }
        return undefined;
      })
      .filter(Boolean)
      .map((v) => v as string)
      .concat(previous_uneval);
    const after_unevaluation = uneval(after, edges, ...initial_uneval);

    const parents_to_update: Set<string> = new Set();

    const changes_step_1 = raw_changes
      .filter((v) => v.type === 'position')
      .map((v) => v as NodeChange<TamaroCardNode>)
      .concat(compute_node_change(befores, after_unevaluation))
      .map((change): NodeChange<TamaroCardNode>[] => {
        if (change.type === 'position') {
          const node = getNode(befores, change.id)!;
          if (node.data.parent) {
            parents_to_update.add(node.data.parent as string);
          } else {
            const previous_position = node.position;
            const current_position = change.position || previous_position;
            const { x: dx, y: dy } = {
              x: current_position.x - previous_position.x,
              y: current_position.y - previous_position.y,
            };
            return (
              befores
                .filter((v) => v.data?.parent === change.id)
                // .filter((v) => !(v.selected && v.dragging))
                .map(
                  ({ id, dragging, selected, position: { x, y } }) =>
                    ({
                      id,
                      position: !(selected && dragging)
                        ? {
                            x: x + dx,
                            y: y + dy,
                          }
                        : undefined,
                      type: 'position',
                    }) as NodePositionChange,
                )
                .concat(change)
            );
          }
        }
        return [change];
      })
      .reduce((a, b) => a.concat(b), [])
      .concat(
        Array.from(parents_to_update).map((parent) =>
          updateParent(get(), parent),
        ),
      );

    const changes = changes_step_1.filter(
      (v) =>
        v.type !== 'select' ||
        v.selected ||
        changes_step_1.find(
          (o) => o.type === 'select' && o.id === v.id && o.selected,
        ) == null,
    );

    set({
      nodes: applyNodeChanges(changes_step_1, befores),
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
    if (
      (previous_uneval.length === initial_uneval.length &&
        previous_uneval.length > 0 &&
        evaluation_timeout == null) ||
      initial_uneval.length > previous_uneval.length
    ) {
      if (evaluation_timeout) clearTimeout(evaluation_timeout);
      evaluation_timeout = setTimeout(async () => {
        const prev = evaluation_timeout;
        const { nodes, edges } = get();
        const evaluated = new Map(
          (await evaluation(nodes, edges)).map((v) => [v.metadata.node_id, v]),
        );
        if (prev !== evaluation_timeout || !evaluation_timeout) return;
        evaluation_timeout = undefined;
        set((state) => ({
          nodes: state.nodes.map(
            (v) =>
              ({
                ...v,
                data: evaluated.get(v.id) || v.data,
              }) as TamaroCardNode,
          ),
        }));
      }, 200);
    }
  },
  onEdgesChange: (changes) => {
    const befores = get().edges;

    const snd_changes: NodeChange<TamaroCardNode>[] = [];
    const node_changes = changes
      .map((v): NodeChange<TamaroCardNode>[] => {
        if (v.type === 'add') {
          const { source, target } = v.item;
          const { getNodes } = get();

          const nodes = getNodes();
          const targetNode = getNode(nodes, target);

          const parent =
            targetNode?.data.parent ||
            (targetNode?.type === 'constant_definition' ? target : undefined);

          if (!parent) return [];
          const sourceNode = getNode(nodes, source);
          if (sourceNode?.data.parent === parent) return [];
          if (!sourceNode) return [];

          const dummy_move = {
            id: source,
            type: 'position',
            dragging: false,
            position: sourceNode?.position,
            positionAbsolute: sourceNode?.position,
          } as NodePositionChange;

          snd_changes.push(dummy_move);

          return getSubTreeFromRoot(nodes, befores, source)
            .map((v) => getNode(nodes, v)!)
            .map(
              (v) =>
                ({
                  type: 'replace',
                  id: v.id,
                  item: {
                    ...v,
                    data: { ...v?.data, parent },
                  } as TamaroCardNode,
                }) as NodeReplaceChange<TamaroCardNode>,
            )
            .map((v) => v as NodeChange<TamaroCardNode>);
        }

        if (v.type === 'remove') {
          const { getNodes } = get();
          const nodes = getNodes();
          const source = befores.find((o) => o.id === v.id)?.source;
          if (!source) return [];
          const sourceNode = getNode(nodes, source);
          if (!sourceNode) return [];

          const dummy_move = {
            id: source,
            type: 'position',
            dragging: false,
            position: sourceNode?.position,
            positionAbsolute: sourceNode?.position,
          } as NodePositionChange;

          snd_changes.push(dummy_move);
          return getSubTreeFromRoot(nodes, befores, source)
            .map((v) => getNode(nodes, v)!)
            .map((v) => ({
              type: 'replace',
              id: v.id,
              item: {
                ...v,
                data: { ...v.data, parent: undefined },
              } as TamaroCardNode,
            }))
            .map((v) => v as NodeChange<TamaroCardNode>);
        }

        return [];
      })
      .reduce((a, b) => a.concat(b), []);
    if (node_changes.length !== 0) get().onNodesChange(node_changes);
    if (snd_changes.length !== 0) get().onNodesChange(snd_changes);

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
    dragged: { type: string; data: TamaroCardNode['data'] } | undefined,
  ) => {
    set({ dragged });
  },
  setNodes: (new_nodes) => {
    get().onNodesChange(compute_node_change(get().nodes, new_nodes));
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
    const newData =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof data === 'function' ? data : (v: any) => ({ ...v, ...data });
    get().setNodes(
      get().nodes.map((v) => {
        return v.id === nodeId ? { ...v, data: newData(v.data) } : v;
      }),
    );
  },
});

export type StoreType = GraphStateSlice & ChangeSliceState & ConfigurationState;

export const useStore = create<StoreType>()(
  persist(
    (...a) => ({
      ...createGraphSlice(...a),
      ...createChangeSlice(...a),
      ...createConfigurationSlice(...a),
    }),
    {
      name: 'playground_graph',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      onRehydrateStorage() {
        return (state) => {
          if (!state) return;

          state.setInitialized('wait');

          const { nodes, edges } = state!;

          function reconstructChildrenMap(v: TamaroCardNode): TamaroCardNode {
            switch (v.data.kind) {
              case 'constant_definition': {
                if (!v.data.root) return v;
                const root_node = getNode(nodes, v.data.root.metadata.node_id);
                return {
                  ...v,
                  data: {
                    ...v.data,
                    root: root_node
                      ? reconstructChildrenMap(root_node).data
                      : undefined,
                  } as ConstantDefinitionNode['data'],
                } as ConstantDefinitionNode;
              }
              case 'function_use': {
                const children = new Map(
                  getChildren(nodes, edges, v, true)
                    .entries()
                    .map(([k, v]) => [
                      getParameterName(k)!,
                      reconstructChildrenMap(v).data as TamaroCard<
                        [],
                        TideNodeMetadata
                      >,
                    ]),
                );

                return {
                  ...v,
                  data: { ...v.data, children } as unknown,
                } as TamaroCardNode;
              }
              default:
                return v;
            }
          }

          state.setNodes(state.nodes.map(reconstructChildrenMap));

          state.setInitialized('done');
        };
      },
    },
  ),
);
