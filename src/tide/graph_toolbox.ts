import { Connection, Edge, NodeReplaceChange, XYPosition } from '@xyflow/react';
import {
  DragEvent as React_DragEvent,
  MouseEvent as React_MouseEvent,
} from 'react';
import {
  ConstantDefinitionNode,
  TamaroCardNode,
} from '../../components/tide/cards';
import { getNode } from './utils';
import { check_edge_looping, check_edge_typing } from './interactivity';
import { StoreType } from './store';

type AllStore = StoreType & {
  screenToFlowPosition: (
    v: XYPosition,
    options?: {
      snapToGrid: boolean;
    },
  ) => XYPosition;

  fullscreen: boolean;
  setFullscreen: (v: boolean) => void;
  mousePosition: XYPosition;
  setMousePosition: (v: XYPosition) => void;
  setIsSelecting: (v: XYPosition & { is_dragging: boolean }) => void;
  isSelecting: XYPosition & { is_dragging: boolean };
};

const PARENT_PADDING = 20;
const TOP_MARGIN = 40;
const RIGHT_MARGIN = 20;

export function updateParent(
  nodes: TamaroCardNode[],
  parent: string,
): NodeReplaceChange<TamaroCardNode> {
  const node = getNode(nodes, parent)! as ConstantDefinitionNode;

  const children = nodes.filter((v) => v.data.parent === parent);

  if (children.length === 0)
    return {
      id: parent,
      item: node,
      type: 'replace',
    };

  const min_x =
    Math.min(
      ...children
        .map((v) => v.position.x)
        .concat(children.map((v) => (v.measured?.width || 0) + v.position.x)),
    ) - PARENT_PADDING;

  const max_x =
    Math.max(
      ...children
        .map((v) => v.position.x)
        .concat(children.map((v) => (v.measured?.width || 0) + v.position.x)),
    ) +
    PARENT_PADDING +
    RIGHT_MARGIN;

  const min_y =
    Math.min(
      ...children
        .map((v) => v.position.y)
        .concat(children.map((v) => (v.measured?.height || 0) + v.position.y)),
    ) - PARENT_PADDING;

  const max_y =
    Math.max(
      ...children
        .map((v) => v.position.y)
        .concat(children.map((v) => (v.measured?.height || 0) + v.position.y)),
    ) + PARENT_PADDING;

  const x_margin =
    (Math.max(max_x - min_x, 50 + (node?.data.text_width as number) || 0) -
      (max_x - min_x)) /
    2;

  const y_margin =
    (Math.max(max_y - min_y, (node?.data.min_height as number) || 0) -
      (max_y - min_y)) /
    2;

  const edit_parent = {
    id: parent,
    item: {
      ...node,
      data: {
        ...node?.data,
        dimensions: {
          width: Math.max(
            max_x - min_x,
            50 + (node?.data.text_width as number) || 0,
          ),
          height: Math.max(
            max_y - min_y,
            (node?.data.min_height as number) || 0,
          ),
        },
      },
      position: { x: min_x - x_margin, y: min_y - TOP_MARGIN - y_margin },
    },
    type: 'replace',
  } as NodeReplaceChange<TamaroCardNode>;

  return edit_parent;
}

export function isValidConnection(
  { getNodes, getEdges, error_level, evaluated_context }: AllStore,
  params: Edge | Connection,
): boolean {
  if (typeof window === 'undefined') return false;

  const nodes = getNodes();
  const edges = getEdges();
  const { source, target, sourceHandle, targetHandle } = params;

  const sourceNode = getNode(nodes, source);
  const targetNode = getNode(nodes, target);

  return Boolean(
    ((!sourceNode?.data.parent && targetNode?.data.parent) ||
      sourceNode?.data.parent === targetNode?.data.parent ||
      sourceNode?.data.parent === targetNode?.id) &&
      check_edge_looping(nodes, edges, source, target) &&
      (error_level !== 'prevent' ||
        targetNode?.type === 'constant_definition' ||
        check_edge_typing(
          evaluated_context(),
          nodes,
          source,
          sourceHandle || '',
          target,
          targetHandle || '',
        )),
  );
}

// eslint-disable-next-line no-empty-pattern
export function onDragOver({}: AllStore, event: React_DragEvent) {
  event.preventDefault();
  // eslint-disable-next-line no-param-reassign
  event.dataTransfer!.dropEffect = 'move';
}

export function onDrop(
  { dragged, screenToFlowPosition, setNodes, getNodes }: AllStore,
  event: React_MouseEvent<HTMLDivElement>,
) {
  event.preventDefault();
  const current_top_layer = document.elementFromPoint(
    event.clientX,
    event.clientY,
  );

  const card_selection_pane = document.getElementById('card_selection_pane');

  if (card_selection_pane?.contains(current_top_layer)) {
    return;
  }

  // check if the dropped element is valid
  if (!dragged) {
    return;
  }

  const topLeftPosition = screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  const id = `${dragged.type}-${Date.now()}`;

  const newNode = {
    id,
    type: dragged.type,
    position: topLeftPosition,
    data: { ...dragged.data, metadata: { node_id: id } },
    dragHandle: '.drag-handle',
    className: 'node_hidden',
  } as TamaroCardNode;

  setNodes(getNodes().concat(newNode));

  setTimeout(() => {
    const newNodes = getNodes();
    setNodes(
      newNodes.map((v) =>
        v.id === newNode.id
          ? {
              ...v,
              position: {
                x: v.position.x - (v.measured?.width || 0) / 2,
                y: v.position.y - (v.measured?.height || 0) / 2,
              },
              className: '',
            }
          : v,
      ),
    );
  });
}

export function onDocumentKeyDown(
  { setFullscreen, redoChange, revertLastChange }: AllStore,
  e: KeyboardEvent,
) {
  {
    if (e.key === 'Escape') setFullscreen(false);
    if (e.key === 'F11') setFullscreen(true);
    if (e.ctrlKey && e.key === 'Z' && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      redoChange();
    } else if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      revertLastChange();
      e.stopPropagation();
    }
  }
}

export function onDocumentCopyCatpure(
  { getNodes, getEdges }: AllStore,
  e: ClipboardEvent,
) {
  e.preventDefault();
  e.stopPropagation();
  e.clipboardData?.clearData();

  const selected = {
    nodes: getNodes()
      .filter((v) => v.selected)
      .map((v) => ({ ...v, data: { ...v.data } })),
    edges: getEdges().filter((v) => v.selected),
  };

  e.clipboardData?.setData('flowchart:graph', JSON.stringify(selected));
}

export function onDocumentPasteCatpure(
  { getNodes, setNodes, getEdges, setEdges, mousePosition }: AllStore,
  e: ClipboardEvent,
) {
  interface FlowChartClipboardData {
    nodes: TamaroCardNode[];
    edges: Edge[];
  }
  const paste = e.clipboardData?.getData('flowchart:graph');

  if (!paste) return;

  const unsafe_data = JSON.parse(paste);

  if (
    !unsafe_data.nodes ||
    !unsafe_data.edges ||
    !(unsafe_data satisfies FlowChartClipboardData)
  )
    return;

  const data = unsafe_data as unknown as FlowChartClipboardData;
  const node_mapping: Map<string, string> = new Map();
  const edge_mapping: Map<string, string> = new Map();

  const randomId = () => {
    let v;

    do {
      v = Math.random().toString(16).slice(2);
    } while (node_mapping.has(v) || edge_mapping.has(v));

    return `${new Date().getTime()}-${v}`;
  };

  const nodes = data.nodes
    .filter((v) => v.type === 'constant_definition')
    .map((constant_def) => {
      return getNodes().filter((v) => v.data.parent === constant_def.id);
    })
    .reduce((a, b) => a.concat(b), [])
    .concat(
      data.nodes.filter(
        (v) =>
          v.data.parent == null ||
          data.nodes.find((o) => o.id === v.data.parent) == null,
      ),
    )
    .map((v) => ({
      ...v,
      $not_selected: data.nodes.find((o) => o.id === v.id) == null,
    }));

  const positions = nodes
    .map((v) => v.position)
    .concat(
      nodes
        .filter((v) => v.measured)
        .map((v) => ({
          x: v.position.x + (v.measured?.width || 0),
          y: v.position.y + (v.measured?.height || 0),
        })),
    );

  const x_min = Math.min(...positions.map((v) => v.x));
  const x_max = Math.max(...positions.map((v) => v.x));
  const y_min = Math.min(...positions.map((v) => v.y));
  const y_max = Math.max(...positions.map((v) => v.y));

  const centroid = { x: (x_min + x_max) / 2, y: (y_min + y_max) / 2 };

  const diff = {
    x: mousePosition.x - centroid.x,
    y: mousePosition.y - centroid.y,
  };

  function getOrCreateNodeMap(id: string): string {
    return node_mapping.has(id)
      ? node_mapping.get(id)!
      : node_mapping.set(id, randomId()).get(id)!;
  }

  const newNodes = nodes.map((v) => {
    return {
      ...v,
      id: getOrCreateNodeMap(v.id),
      position: { x: v.position.x + diff.x, y: v.position.y + diff.y },
      data: {
        ...v.data,
        metadata: {
          node_id: getOrCreateNodeMap(v.data.metadata.node_id),
        },
        parent: v.data.parent
          ? getOrCreateNodeMap(v.data.parent as string)
          : undefined,
      },
    } as TamaroCardNode;
  });

  const newEdges = data.nodes
    .filter((v) => v.type === 'constant_definition')
    .map((constant_def) => {
      return (
        getNodes()
          .filter((v) => v.data.parent === constant_def.id)
          .map((source) => getEdges().filter((v) => v.source === source.id))
          .reduce((a, b) => a.concat(b), [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((v): Edge => ({ ...v, $not_selected: true }) as any as Edge)
      );
    })
    .reduce((a, b) => a.concat(b), [])
    .concat(...data.edges)
    .map((v) => {
      const newId = randomId();

      edge_mapping.set(v.id, newId);

      const idSource = node_mapping.get(v.source);
      const idTarget = node_mapping.get(v.target);

      if (!idSource || !idTarget) return undefined;

      return {
        ...v,
        id: newId,
        source: idSource,
        target: idTarget,
      };
    })
    .filter((v) => v)
    .map((v) => v as Edge);

  setNodes(
    getNodes()
      .map((v) => ({ ...v, selected: false }))
      .concat(
        newNodes.map((v) => ({
          ...v,
          selected:
            v.data.parent == null ||
            data.nodes.find((o) => o.id === v.data.parent) == null,
        })),
      ),
  );

  setEdges(
    getEdges()
      .map((v) => ({ ...v, selected: false }))
      .concat(
        newEdges.map((v) => ({
          ...v,
          selected: Object.keys(v).includes('$not_selected') ? false : true,
          $not_selected: undefined,
        })),
      ),
  );
}

export function onDocumentMouseMove(
  { setMousePosition, screenToFlowPosition }: AllStore,
  e: MouseEvent,
) {
  setMousePosition(
    screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    }),
  );
}

export function onMouseDown(
  { setIsSelecting, mousePosition }: AllStore,
  event: React_MouseEvent<HTMLDivElement, MouseEvent>,
) {
  if (event.ctrlKey) {
    setIsSelecting({
      is_dragging: true,
      ...mousePosition,
    });
  }
}

export function onMouseUp(
  {
    isSelecting,
    setIsSelecting,
    mousePosition,
    setNodes,
    setEdges,
    getNodes,
    getEdges,
  }: AllStore,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  event: React_MouseEvent<HTMLDivElement, MouseEvent>,
) {
  if (!isSelecting.is_dragging) return;
  const min_point = {
    x: Math.min(isSelecting.x, mousePosition.x),
    y: Math.min(isSelecting.y, mousePosition.y),
  };
  const max_point = {
    x: Math.max(isSelecting.x, mousePosition.x),
    y: Math.max(isSelecting.y, mousePosition.y),
  };

  const x_0 = min_point.x;
  const y_0 = min_point.y;
  const x_1 = max_point.x;
  const y_1 = max_point.y;

  setIsSelecting({
    is_dragging: false,
    ...mousePosition,
  });

  function rectanglesIntersect(
    minBx: number,
    minBy: number,
    maxBx: number,
    maxBy: number,
  ) {
    const aLeftOfB: boolean = x_1 < minBx;
    const aRightOfB: boolean = x_0 > maxBx;
    const aAboveB: boolean = y_0 > maxBy;
    const aBelowB: boolean = y_1 < minBy;

    return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
  }

  const selected_nodes = getNodes()
    .filter((v) => {
      if (!v.measured) return false;
      const v_x = v.position.x;
      const v_y = v.position.y;
      const v2_x = v_x + v.measured.width!;
      const v2_y = v_y + v.measured.height!;

      return rectanglesIntersect(v_x, v_y, v2_x, v2_y);
    })
    .map((v) => v.id);

  const selected_edges = getEdges()
    .filter(
      (v) =>
        selected_nodes.includes(v.target) && selected_nodes.includes(v.source),
    )
    .map((v) => v.id);

  setTimeout(() => {
    setNodes(
      getNodes().map((v) => {
        const isSelected = selected_nodes.includes(v.id);

        if (!isSelected) return v;
        return {
          ...v,
          selected: true,
        };
      }),
    );

    setEdges(
      getEdges().map((v) => {
        const isSelected = selected_edges.includes(v.id);

        if (!isSelected) return v;
        return {
          ...v,
          selected: true,
        };
      }),
    );
  }, 20);
}
