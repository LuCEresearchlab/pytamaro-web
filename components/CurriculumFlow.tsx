import {
  Box,
} from '@mui/material';
import ReactFlow, {
  Edge, Node, ReactFlowInstance, useStore,
} from 'reactflow';
import dagre from 'dagre';
import useLocalStorageState from 'use-local-storage-state';
import { Curriculum } from '../src/Curricula';
import { METADATA_KEY, getDefaultMetadata } from '../src/codeState';
import ActivityNode from './ActivityNode';
import SumNode from './SumNode';
import 'reactflow/dist/style.css';

const nodeTypes = { activity: ActivityNode, sum: SumNode };

const rfStyle = {
  backgroundColor: 'primary.main',
};
const nodeOptions = {
  position: { x: 0, y: 0 },
  draggable: false,
  selectable: false,
  connectable: false,
  deletable: false,
  focusable: false,
};
const edgeOptions = {
  deletable: false,
  focusable: false,
  style: {
    strokeWidth: 10,
  },
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// https://reactflow.dev/docs/examples/layout/dagre/
function getLayoutedNodes(nodes: Node[], edges: Edge[], direction = 'TB') {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  const getDimensions = (node: Node) => {
    const { width, height } = node;
    if (width && height) {
      return { width, height };
    }
    return {
      width: 70,
      height: 70,
    };
  };

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, getDimensions(node));
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getDimensions(node);
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    } as Node;
  });

  return newNodes;
}

export default function CurriculumFlow({ curriculum }: { curriculum : Curriculum }) {
  const [metadata] = useLocalStorageState(METADATA_KEY, {
    defaultValue: getDefaultMetadata(),
  });
  const completedActivityVariantIds = metadata.activities
    .filter((a) => a.completed)
    .map((a) => a.id);

  // get nodes
  const initialNodes: Node[] = curriculum.activities.flatMap(
    (a) => {
      const activityNodeId = a.id;
      const isCompleted = completedActivityVariantIds.includes(activityNodeId);
      const isUnlocked = a.activityRequirements.every(
        (asum) => asum.some(
          (aterm) => completedActivityVariantIds.includes(aterm),
        ),
      );
      return [
        {
          ...nodeOptions,
          id: activityNodeId,
          type: 'activity',
          data: {
            id: a.id,
            activity: a.activity,
            variant: a.variant,
            isCompleted,
            isUnlocked,
          },
        } as Node,
        ...a.activityRequirements.flatMap(
          (asum, sumIndex) => {
            if (asum.length > 1) {
              return {
                ...nodeOptions,
                id: `${activityNodeId}-sum-${sumIndex}`,
                type: 'sum',
                data: {},
              } as Node;
            }
            return [];
          },
        ),
      ];
    },
  );
  // get edges
  const initialEdges: Edge[] = curriculum.activities.flatMap(
    (a) => {
      const activityNodeId = a.id;
      return a.activityRequirements.flatMap(
        (asum, sumIndex) => {
          if (asum.length > 1) {
            return [
              {
                ...edgeOptions,
                id: `${activityNodeId}-edge-${sumIndex}`,
                source: `${activityNodeId}-sum-${sumIndex}`,
                target: activityNodeId,
              } as Edge,
              ...asum.map(
                (aterm, termIndex) => ({
                  ...edgeOptions,
                  id: `${activityNodeId}-edge-${sumIndex}-${termIndex}`,
                  source: aterm,
                  target: `${activityNodeId}-sum-${sumIndex}`,
                } as Edge),
              ),
            ];
          }
          if (asum.length === 1) {
            return {
              ...edgeOptions,
              id: `${activityNodeId}-edge-${sumIndex}`,
              source: asum[0],
              target: activityNodeId,
            } as Edge;
          }
          // asum.length === 0
          return [];
        },
      );
    },
  );

  const scrollWidthSelector = (state: { domNode: any }) => state.domNode?.scrollWidth || 1;
  const scrollHeightSelector = (state: { domNode: any }) => state.domNode?.scrollHeight || 1;
  const reactFlowWidth = useStore(scrollWidthSelector);
  const reactFlowHeight = useStore(scrollHeightSelector);

  function onInit(r: ReactFlowInstance) {
    if (r.getNodes()[0]?.width) {
      // layout
      const layoutedNodes = getLayoutedNodes(
        r.getNodes(),
        r.getEdges(),
      );
      r.setNodes(layoutedNodes);
    }
  }

  return (
    <Box style={{
      width: reactFlowWidth,
      height: reactFlowHeight,
    }}
    >
      <ReactFlow
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        nodeTypes={nodeTypes}
        style={rfStyle}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        onInit={(r) => onInit(r)}
      />
    </Box>
  );
}
