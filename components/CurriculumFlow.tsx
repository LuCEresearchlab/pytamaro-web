import {
  Box,
} from '@mui/material';
import ReactFlow, {
  Edge, MiniMap, Node, useEdgesState, useNodesState,
} from 'reactflow';
import dagre from 'dagre';
import useLocalStorageState from 'use-local-storage-state';
import { Curriculum, CurriculumActivityId } from '../src/Curricula';
import { METADATA_KEY, getDefaultMetadata } from '../src/codeState';
import ActivityNode from './ActivityNode';
import SumNode from './SumNode';
import 'reactflow/dist/style.css';

const nodeTypes = { activity: ActivityNode, sum: SumNode };

const rfStyle = {
  backgroundColor: '#B8CEFF',
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// https://reactflow.dev/docs/examples/layout/dagre/
function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  console.log(nodes);

  const getDimensions = (node: Node) => {
    const { width, height } = node;
    if (width && height) {
      return { width, height };
    }
    return {
      width: 700,
      height: 1000,
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

  return { nodes: newNodes, edges };
}

export default function CurriculumFlow({ curriculum }: { curriculum : Curriculum }) {
  const [metadata] = useLocalStorageState(METADATA_KEY, {
    defaultValue: getDefaultMetadata(),
  });
  const completedActivityVariantIds = metadata.activities
    .filter((a) => a.completed)
    .map((a) => {
      const [authorSlug, activitySlug, language] = a.id.split('/');
      return JSON.stringify({
        authorSlug,
        activitySlug,
        language,
      } as CurriculumActivityId);
    });

  // get nodes
  const initialNodes: Node[] = curriculum.activities.flatMap(
    (a) => {
      const activityNodeId = JSON.stringify(a.id);
      const isCompleted = completedActivityVariantIds.includes(activityNodeId);
      const isUnlocked = a.activityRequirements.every(
        (asum) => asum.some(
          (aterm) => completedActivityVariantIds.includes(JSON.stringify(aterm)),
        ),
      );
      return [
        {
          id: activityNodeId,
          type: 'activity',
          position: { x: 0, y: 0 },
          data: {
            authorSlug: a.id.authorSlug,
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
                id: `${activityNodeId}-sum-${sumIndex}`,
                type: 'sum',
                position: { x: 0, y: 0 },
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
      const activityNodeId = JSON.stringify(a.id);
      return a.activityRequirements.flatMap(
        (asum, sumIndex) => {
          if (asum.length > 1) {
            return [
              {
                id: `${activityNodeId}-edge-${sumIndex}`,
                source: `${activityNodeId}-sum-${sumIndex}`,
                target: `${activityNodeId}`,
              } as Edge,
              ...asum.map(
                (aterm, termIndex) => ({
                  id: `${activityNodeId}-edge-${sumIndex}-${termIndex}`,
                  source: JSON.stringify(aterm),
                  target: `${activityNodeId}-sum-${sumIndex}`,
                } as Edge),
              ),
            ];
          }
          if (asum.length === 1) {
            return {
              id: `${activityNodeId}-edge-${sumIndex}`,
              source: JSON.stringify(asum[0]),
              target: `${activityNodeId}`,
            } as Edge;
          }
          // asum.length === 0
          return [];
        },
      );
    },
  );
  const [nodes,, onNodesChange] = useNodesState(initialNodes);
  const [edges,, onEdgesChange] = useEdgesState(initialEdges);
  // get layouted elements
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodes,
    edges,
  );

  return (
    <Box style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        style={rfStyle}
      >
        <MiniMap />
      </ReactFlow>
    </Box>
  );
}
