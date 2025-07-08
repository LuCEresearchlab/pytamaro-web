import { StateCreator } from 'zustand';
import { CardType, CodeRepresentation } from './cards';
import { StoreType } from './store';
import {
  getChildren,
  getFunctionParameterRelative,
  getHandleType,
  getNode,
  getParents,
} from './utils';
import { ITamaroFunctionCardData } from './cards/function';
import { ITamaroLiteralCardData } from './cards/literal';
import { ITamaroConstantCardData } from './cards/constant';
import { Node } from '@xyflow/react';
import { ITamaroConstantDefinitionCardData } from './cards/constant_definition';

interface ImgState {
  id: string;
  children: { handle: string }[];
  code?: CodeRepresentation;
  upToDate: boolean;
}

export interface ImgStateSlice {
  img_states: ImgState[];
  queue: string[];

  invalidate_node: (id: string) => void;

  unstack_queue: () => void;
}

function fuseQueue(queue: string[], ...new_values: string[]) {
  return queue.filter((v) => !new_values.includes(v)).concat(new_values);
}

export const createImgStateSlice: StateCreator<
  StoreType,
  [],
  [],
  ImgStateSlice
> = (set, get) => ({
  img_states: [],
  queue: [],

  invalidate_node(id) {
    const { nodes, edges, img_states } = get();
    const node = getNode(nodes, id);
    if (!img_states.find((v) => v.id === id)) {
      let children: { handle: string }[] = [];
      if (node?.type === 'function')
        children = (
          node.data as unknown as ITamaroFunctionCardData
        ).value.parameters
          .filter((v) => v.default == null)
          .map((v) => ({ handle: v.name }));

      set((state) => ({
        img_states: state.img_states.concat({
          id,
          children,
          upToDate: false,
          code: undefined,
        }),
        queue: fuseQueue(state.queue, id),
      }));
      if (node) get().updateAnnotation(node);
      return;
    }
    const parents = getParents(nodes, edges, id);
    const usages =
      node?.type === 'constant_definition'
        ? nodes.filter(
            (v) => v.type === 'constant_use' && v.data.name === node?.data.name,
          )
        : [];

    set((state) => ({
      img_states: state.img_states
        .map((img) => {
          const isParent = parents
            .entries()
            .find((v) => parents.get(v[1].id)?.id === img.id);
          if (!isParent) return img;

          return {
            ...img,
            code: undefined,
            upToDate: false,
          };
        })
        .map((img) => {
          const isUsage = usages.find((v) => v.id === img.id);
          if (!isUsage) return img;

          return {
            ...img,
            code: undefined,
            upToDate: false,
          };
        })
        .map((img) =>
          img.id !== id
            ? img
            : {
                ...img,
                code: undefined,
                upToDate: false,
              },
        ),
      queue: fuseQueue(
        state.queue,
        ...Array.from(parents.values().map((v) => v.id)),
        ...usages.map((v) => v.id),
      ),
    }));

    set((state) => ({ queue: fuseQueue(state.queue, id) }));

    if (node) get().updateAnnotation(node);
  },

  unstack_queue() {
    const { queue, img_states, nodes, edges } = get();
    if (queue.length === 0) return;
    const element = queue.shift()!;
    const data = img_states.find((v) => v.id === element)!;
    const unsafe_children = data.children.map(({ handle }) =>
      getFunctionParameterRelative(nodes, edges, data.id, handle, false),
    );
    if (data.upToDate) {
      set({ queue });
      return;
    }
    if (unsafe_children.includes(undefined)) {
      set({
        img_states: img_states.map((v) =>
          v.id !== data.id
            ? v
            : {
                ...v,
                code: undefined,
                upToDate: true,
              },
        ),
        queue,
      });

      get().updateNodeData(data.id, (data) => ({
        ...data,
        representation: undefined,
      }));

      const parents = getParents(nodes, edges, data.id);
      parents.values().forEach((v) => get().invalidate_node(v.id));
      return;
    }

    const children = (unsafe_children as Node[]).map((v) =>
      img_states.find((o) => o.id === v.id),
    );
    if (children.includes(undefined) || children.find((v) => v?.code == null)) {
      set({
        img_states: img_states.map((v) =>
          v.id !== data.id
            ? v
            : {
                ...v,
                code: undefined,
                upToDate: true,
              },
        ),
        queue,
      });

      get().updateNodeData(data.id, (data) => ({
        ...data,
        representation: undefined,
      }));

      const parents = getParents(nodes, edges, data.id);
      parents.values().forEach((v) => get().invalidate_node(v.id));
      return;
    }
    const node = getNode(nodes, data.id)!;

    const type = node?.type;
    let code: CodeRepresentation | undefined;

    switch (type as CardType) {
      case 'function': {
        const card_data = node?.data as unknown as ITamaroFunctionCardData;
        const fn = card_data.value;

        const params = children.map((v) => v!.code!);

        const expression = `${fn.name}(${params.map((v) => v.expression).join(',')})`;

        const imports = params
          .map((v) => v.imports)
          .reduce((a, b) => a.concat(b), [])
          .concat({ module: card_data.module, name: card_data.name });

        code = { expression, imports };

        set((state) => ({
          queue,
          img_states: state.img_states.map((v) =>
            v.id !== data.id ? v : { ...data, upToDate: true, code },
          ),
        }));
        break;
      }

      case 'literal': {
        const card_data = node?.data as unknown as ITamaroLiteralCardData;
        const expression = String(card_data.value || 0);

        code = { expression, imports: [] };
        set((state) => ({
          queue,
          img_states: state.img_states.map((v) =>
            v.id !== data.id
              ? v
              : {
                  ...data,
                  upToDate: true,
                  code,
                },
          ),
        }));
        break;
      }

      case 'constant': {
        const card_data = node?.data as unknown as ITamaroConstantCardData;

        const expression = card_data.name;
        const imports = [{ module: card_data.module, name: card_data.name }];

        code = { expression, imports };
        set((state) => ({
          queue,
          img_states: state.img_states.map((v) =>
            v.id !== data.id
              ? v
              : {
                  ...data,
                  upToDate: true,
                  code,
                },
          ),
        }));
        break;
      }

      case 'constant_definition': {
        const { name } =
          node.data as unknown as ITamaroConstantDefinitionCardData;
        const child = getChildren(nodes, edges, node, true).get('output');
        if (child) {
          const supposed_type = getHandleType(nodes, child, 'output');
          get().updateNodeData(data.id, (data) => ({
            ...data,
            type: supposed_type,
          }));

          set((state) => ({
            queue,
            img_states: state.img_states.map((v) =>
              v.id !== data.id
                ? v
                : {
                    ...data,
                    upToDate: true,
                    code: state.img_states.find((v) => v.id === child.id)?.code,
                  },
            ),
          }));
        } else {
          set((state) => ({
            queue,
            img_states: state.img_states.map((v) =>
              v.id !== data.id
                ? v
                : {
                    ...data,
                    upToDate: true,
                    code: undefined,
                  },
            ),
          }));
        }

        const usages = get().nodes.filter(
          (v) => v.type === 'constant_use' && v.data.name === name,
        );
        usages.map((v) => v.id).forEach(get().invalidate_node);
        break;
      }

      case 'constant_use': {
        const { name } =
          node?.data as unknown as ITamaroConstantDefinitionCardData;

        const definitions = nodes.filter(
          (v) => v.type === 'constant_definition' && v.data.name === name,
        );

        if (definitions.length === 1) {
          set((state) => ({
            queue,
            img_states: state.img_states.map((v) =>
              v.id !== data.id
                ? v
                : {
                    ...data,
                    upToDate: true,
                    code: state.img_states.find(
                      (v) => v.id === definitions[0].id,
                    )?.code,
                  },
            ),
          }));
        }
        break;
      }
    }
    if (
      JSON.stringify({ ...data, upToDate: true }) !==
      JSON.stringify(get().img_states.find((v) => v.id === data.id))
    ) {
      const parents = getParents(nodes, edges, data.id);
      parents.values().forEach((v) => get().invalidate_node(v.id));
    }

    get().updateNodeData(data.id, (data) => ({
      ...data,
      representation: code,
    }));

    get().updateAnnotation(node);
  },
});
