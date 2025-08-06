import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
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
import { ChangeSliceState, createChangeSlice } from './changes';
import { ConfigurationState, createConfigurationSlice } from './configuration';
import {
  compute_edge_change,
  compute_node_change,
  getNode,
  getSubTreeFromRoot,
  getUnevalutedChange,
  reconstructChildrenMap,
} from './utils';
import { updateParent } from './graph_toolbox';
import {
  CardType,
  node_types,
  TamaroCardNode,
  TideNode,
  TideNodeMetadata,
} from '../../components/tide/cards';
import { evaluation, propagate_unevaluation } from './evaluation';
import {
  EvaluatedConstantDefinition,
  EvaluatedDefinitions,
} from './language/definitions';
import { getDefaultContext } from '../../cypress/e2e/tide/data';
import { JudiciousModule } from '../schemas/documentation';

export interface DraggedElementData {
  type: string;
  data: TideNode['data'];
}

let evaluation_timeout: NodeJS.Timeout | undefined = undefined;
export interface GraphStateSlice {
  dragged: TamaroCardNode['data'] | undefined;
  judicious: JudiciousModule[];
  setJudicious(modules: JudiciousModule[]);
  initialized: 'before' | 'wait' | 'done';
  setInitialized: (v: 'before' | 'wait' | 'done') => void;
  evaluated_context: () => EvaluatedDefinitions<TideNodeMetadata>;
  nodes: TideNode[];
  edges: Edge[];
  mousePosition: XYPosition;
  reserved_names: string[];
  setReservedNames: (v: string[]) => void;
  setMousePosition: (v: XYPosition) => void;
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
  onNodesChange: OnNodesChange<TideNode>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;
  setNodes: (nodes: TideNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  getNodes: () => TideNode[];
  getEdges: () => Edge[];
  setDragged: (dragged: TamaroCardNode['data'] | undefined) => void;
  updateNodeData: <
    C extends TideNode['type'],
    T extends TideNode & { type: C },
  >(
    nodeId: string,
    card: C,
    data: Partial<T['data']> | ((v: T['data']) => T['data']),
  ) => void;
}

export const createGraphSlice: StateCreator<
  StoreType,
  [],
  [],
  GraphStateSlice
> = (set, get) => ({
  judicious: [],
  setJudicious: (modules: JudiciousModule[]) => {
    set({ judicious: modules });
  },
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
          (v) =>
            v &&
            v.data &&
            v.data.kind === 'constant_definition' &&
            v.data.evaluated,
        )
        .map((v) => v.data as EvaluatedConstantDefinition<TideNodeMetadata>),
    );
  },
  onNodesChange: (raw_changes) => {
    const { nodes: befores, edges } = get();

    const previous_uneval = befores
      .filter((v) => !v.data.evaluated)
      .map((v) => v.id);

    const current_uneval_origin = getUnevalutedChange(
      befores,
      raw_changes,
    ).concat(previous_uneval);

    const current_uneval = propagate_unevaluation(
      befores,
      edges,
      ...current_uneval_origin,
    );

    const parents_to_update: Set<string> = new Set();

    const changes_step_1 = raw_changes
      .map((change): NodeChange<TideNode>[] => {
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
            return befores
              .filter((v) => v.data?.parent === change.id)
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
              .concat(change);
          }
        }
        if (change.type === 'replace') {
          const before_node = getNode(befores, change.id)!;
          if (before_node.data.parent) {
            parents_to_update.add(before_node.data.parent as string);
          }
        }
        return [change];
      })
      .reduce((a, b) => a.concat(b), []);

    const interm_nodes = applyNodeChanges(changes_step_1, get().nodes);
    const changes_step_2 = changes_step_1.concat(
      Array.from(parents_to_update).map((parent) =>
        updateParent(interm_nodes, parent),
      ),
    );

    const changes = changes_step_2.filter(
      (v) =>
        v.type !== 'select' ||
        v.selected ||
        changes_step_2.find(
          (o) => o.type === 'select' && o.id === v.id && o.selected,
        ) == null,
    );

    set({
      nodes: applyNodeChanges(changes_step_2, befores).map((v) =>
        !current_uneval.includes(v.id)
          ? v
          : ({ ...v, data: { ...v.data, evaluated: false } } as TideNode),
      ),
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
      true &&
      ((previous_uneval.length === current_uneval_origin.length &&
        previous_uneval.length > 0 &&
        evaluation_timeout == null) ||
        current_uneval_origin.length > previous_uneval.length)
    ) {
      if (evaluation_timeout) clearTimeout(evaluation_timeout);
      evaluation_timeout = setTimeout(
        async () => {
          const prev = evaluation_timeout;
          const { nodes, edges } = get();
          const evaluated = new Map(
            (await evaluation(nodes, edges)).map((v) => [v.id, v.data]),
          );
          if (prev !== evaluation_timeout || !evaluation_timeout) return;
          evaluation_timeout = undefined;

          set((state) => {
            return {
              nodes: state.nodes.map(
                (v) =>
                  ({
                    ...v,
                    data: evaluated.get(v.id),
                  }) as TideNode,
              ),
            };
          });
        },
        get().initialized === 'done' ? 200 : 1000,
      );
    }
  },
  onEdgesChange: (changes) => {
    const befores = get().edges;

    const snd_changes: NodeChange<TideNode>[] = [];
    const node_changes = changes
      .map((v): NodeChange<TideNode>[] => {
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
                  } as TideNode,
                }) as NodeReplaceChange<TideNode>,
            )
            .map((v) => v as NodeChange<TideNode>);
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
              } as TideNode,
            }))
            .map((v) => v as NodeChange<TideNode>);
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
  setDragged: (dragged: TamaroCardNode['data'] | undefined) => {
    set({ dragged });
  },
  setNodes: (new_nodes) => {
    get().onNodesChange(compute_node_change(get().nodes, new_nodes));
  },
  getNodes: () => get().nodes,
  setEdges: (new_edges) => {
    get().onEdgesChange(compute_edge_change(get().edges, new_edges));
  },
  getEdges: () => get().edges,
  updateNodeData: <
    C extends TideNode['type'],
    T extends TideNode & { type: C },
  >(
    nodeId: string,
    _card: C,
    data: Partial<T['data']> | ((v: T['data']) => T['data']),
  ) => {
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

          state.setNodes(reconstructChildrenMap(nodes, edges));

          state.setInitialized('done');
        };
      },
    },
  ),
);
