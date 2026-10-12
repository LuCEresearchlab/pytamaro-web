/* eslint-disable @typescript-eslint/strict-boolean-expressions */
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
import {
  TamaroCardNode,
  TideNode,
  TideNodeMetadata,
} from '../../components/tide/cards';
import { ExecutionResponse, PythonMode } from '../execution/codeExecution';
import { ExecutionMetadata } from '../execution/messageTypes';
import { ToolboxFunction } from '../localStorage/schema';
import { PythonFile } from '../schemas/activitySchema';
import { JudiciousModule } from '../schemas/documentation';
import { ChangeSliceState, createChangeSlice } from './changes';
import { ConfigurationState, createConfigurationSlice } from './configuration';
import { construct, evaluation, synchronous_phases } from './evaluation';
import { updateParent } from './graph_toolbox';
import { TideJudiciousMetadata } from './judiciours_to_tide';
import { Definition } from './language/definitions';
import { toFlat } from './language/utils';
import {
  compute_edge_change,
  compute_node_change,
  getNode,
  getSubTreeFromRoot,
} from './utils';

export type DraggedCard = Pick<TamaroCardNode, 'type' | 'data'> & {
  // Pointer position relative to the item's top-left corner at drag start
  grabOffset: XYPosition;
};

export interface DraggedElementData {
  type: string;
  data: TideNode['data'];
}

let execute: (
  sources: string[],
  idx: number,
  toolboxFunctions: ToolboxFunction[],
  extraPythonFiles: PythonFile[],
  executionMetadata: ExecutionMetadata,
  pythonMode: PythonMode,
) => Promise<ExecutionResponse> = () => new Promise((_, reject) => reject());

export function setExecute(
  fn: (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    executionMetadata: ExecutionMetadata,
    pythonMode: PythonMode,
  ) => Promise<ExecutionResponse>,
) {
  execute = fn;
}

let evaluation_timeout: NodeJS.Timeout | undefined = undefined;
export interface GraphStateSlice {
  dragged: DraggedCard | undefined;
  judicious: JudiciousModule[];
  setJudicious: (modules: JudiciousModule[]) => void;
  initialized: 'before' | 'wait' | 'done';
  setInitialized: (v: 'before' | 'wait' | 'done') => void;
  evaluated_context: () => Definition<
    TideNodeMetadata,
    TideNodeMetadata,
    TideJudiciousMetadata,
    'evaluated'
  >[];
  evaluating: boolean;
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
  setDragged: (dragged: DraggedCard | undefined) => void;
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
  evaluating: false,
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
    return get()
      .imported_definitions.map(
        (v) =>
          v as Definition<
            TideNodeMetadata,
            TideNodeMetadata,
            TideJudiciousMetadata,
            'evaluated'
          >,
      )
      .concat(
        get()
          .nodes.filter(
            (v) =>
              v &&
              v.data &&
              v.type === 'constant_definition' &&
              v.data.tide_node &&
              'code_element' in v.data.tide_node,
          )
          .map(
            (v) =>
              v.data.tide_node! as Definition<
                TideNodeMetadata,
                TideNodeMetadata,
                TideJudiciousMetadata,
                'evaluated'
              >,
          ),
      );
  },
  onNodesChange: (raw_changes) => {
    const { nodes: befores } = get();

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
      nodes: applyNodeChanges(changes_step_2, befores),
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

    if (get().nodes.find((v) => v.data.outdated)) {
      const constructed = construct(
        get().imported_definitions,
        get().nodes,
        get().edges,
      );

      const sync = synchronous_phases(constructed);

      const flat_sync = sync.expressions
        .map(toFlat)
        .flat()
        .map((v) => v as { metadata: TideNodeMetadata })
        .concat(
          sync.local_definitions
            .map((v) => (v.root ? [v, v.root] : [v]))
            .flat(),
        );

      set((state) => {
        return {
          nodes: state.nodes.map((node) => {
            const el = flat_sync.find((v) => v.metadata.node_id === node.id);
            if (!el) return node;
            return {
              ...node,
              data: {
                ...node.data,
                tide_node: el,
                outdated: undefined,
              },
            } as TideNode;
          }),
          evaluating: true,
        };
      });

      if (evaluation_timeout) clearTimeout(evaluation_timeout);

      evaluation_timeout = setTimeout(
        async () => {
          const prev = evaluation_timeout;

          const async = await evaluation(execute, sync);
          if (prev !== evaluation_timeout || !evaluation_timeout) return;
          evaluation_timeout = undefined;

          const flat_async = async.expressions
            .map(toFlat)
            .flat()
            .map((v) => v as { metadata: TideNodeMetadata })
            .concat(
              async.local_definitions
                .map((v) => (v.root ? [v, v.root] : [v]))
                .flat(),
            );

          set((state) => {
            return {
              nodes: state.nodes.map((node) => {
                const el = flat_async.find(
                  (v) => v.metadata.node_id === node.id,
                );
                if (!el) return node;
                return {
                  ...node,
                  data: {
                    ...node.data,
                    tide_node: el,
                    outdated: undefined,
                  },
                } as TideNode;
              }),
              evaluating: false,
            };
          });
        },
        get().initialized === 'done' ? 200 : 1000,
      );
    }
  },
  onEdgesChange: (changes) => {
    const befores = get().edges;

    const to_update: string[] = [];
    const snd_changes: NodeChange<TideNode>[] = [];

    changes.forEach((v) => {
      if (v.type === 'add') {
        to_update.push(v.item.source);
        to_update.push(v.item.target);
      } else if (v.type === 'remove') {
        const { source, target } = befores.find((o) => o.id === v.id)!;
        to_update.push(source);
        to_update.push(target);
      }
    });

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

    get().setNodes(
      get().nodes.map((v) =>
        !to_update.includes(v.id)
          ? v
          : ({ ...v, data: { ...v.data, outdated: true } } as TideNode),
      ),
    );
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
  setDragged: (dragged: DraggedCard | undefined) => {
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
      get().nodes.map((v): TideNode => {
        return v.id === nodeId
          ? { ...v, data: { ...newData(v.data), outdated: true } }
          : v;
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
      name: 'tide-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      onRehydrateStorage() {
        return (state) => {
          if (!state) return;

          state.setInitialized('wait');

          state.setNodes(
            state
              .getNodes()
              .map(
                (v) =>
                  ({ ...v, data: { ...v.data, outdated: true } }) as TideNode,
              ),
          );

          state.setInitialized('done');
        };
      },
    },
  ),
);
