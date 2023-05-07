import {
  Box,
} from '@mui/material';
import ReactFlow, {
  Edge, Node, ReactFlowInstance, useStore,
} from 'reactflow';
import dagre from 'dagre';
import ActivityNode from './ActivityNode';
import SumNode from './SumNode';
import 'reactflow/dist/style.css';

const nodeTypes = {
  activity: ActivityNode,
  sum: SumNode,
};
const rfStyle = {
  backgroundColor: 'primary.main',
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// https://reactflow.dev/docs/examples/layout/dagre/
function getLayoutedNodes(
  nodes: Node[],
  edges: Edge[],
  getDimensions: (node: Node) => { width: number, height: number },
  direction = 'TB',
) {
  const isHorizontal = direction === 'LR';

  const nodeIds = [] as string[];
  nodes.forEach((node, idx) => {
    if (node.type === 'group') {
      if (idx !== 0) {
        // add edges inside subflow to dagre
        edges.forEach((edge) => {
          if (nodeIds.includes(edge.source) && nodeIds.includes(edge.target)) {
            dagreGraph.setEdge(edge.source, edge.target);
          }
        });
        // layout
        dagre.layout(dagreGraph);
        // empty array
        nodeIds.splice(0, nodeIds.length);
      }
      // reset dagre
      dagreGraph.setGraph({ rankdir: direction });
    } else {
      // add node to dagre
      dagreGraph.setNode(node.id, getDimensions(node));
      nodeIds.push(node.id);
    }
  });
  // add edges inside subflow to dagre
  edges.forEach((edge) => {
    if (nodeIds.includes(edge.source) && nodeIds.includes(edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });
  // layout
  dagre.layout(dagreGraph);

  const groupDimensions = [] as { width: number, height: number }[];
  const groupDimension = { width: 0, height: 0 };
  const newNodes = nodes.map((node, idx) => {
    if (node.type === 'group') {
      if (idx !== 0) {
        groupDimensions.push(groupDimension);
        groupDimension.width = 0;
        groupDimension.height = 0;
      }
      return node;
    }
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getDimensions(node);
    const newGroupWidth = nodeWithPosition.x + width / 2;
    const newGroupHeight = nodeWithPosition.y + height / 2;
    if (groupDimension.width < newGroupWidth) {
      groupDimension.width = newGroupWidth;
    }
    if (groupDimension.height < newGroupHeight) {
      groupDimension.height = newGroupHeight;
    }
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
  groupDimensions.push(groupDimension);

  // update dimensions of group nodes
  let groupNodeIdx = 0;
  const newNewNodes = newNodes.map((node) => {
    if (node.type === 'group') {
      const { width, height } = groupDimensions[groupNodeIdx];
      groupNodeIdx += 1;
      return {
        ...node,
        width,
        height,
        style: {
          ...node.style,
          width,
          height,
        },
      };
    }
    return node;
  });

  return newNewNodes;
}

function onInit(nodes: Node[], edges: Edge[], r: ReactFlowInstance) {
  const getDimensions = (node: Node) => {
    const defaultDimensions = {
      width: 70,
      height: 70,
    };
    const nodeWithDimensions = r.getNode(node.id);
    if (nodeWithDimensions === undefined) {
      return defaultDimensions;
    }
    const { width, height } = nodeWithDimensions;
    if (width && height) {
      return {
        width,
        height,
      };
    }
    return defaultDimensions;
  };
  const layoutedNodes = getLayoutedNodes(
    nodes,
    edges,
    getDimensions,
  );
  console.log(layoutedNodes);
  r.setNodes(layoutedNodes);
}

export default function CurriculumFlow({ nodes, edges }: { nodes : Node[], edges : Edge[] }) {
  const scrollWidthSelector = (state: { domNode: any }) => state.domNode?.scrollWidth || 1;
  const scrollHeightSelector = (state: { domNode: any }) => state.domNode?.scrollHeight || 1;
  const reactFlowWidth = useStore(scrollWidthSelector);
  const reactFlowHeight = useStore(scrollHeightSelector);

  return (
    <Box
      alignSelf="center"
      style={{
        width: reactFlowWidth,
        height: reactFlowHeight,
      }}
    >
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={nodeTypes}
        style={rfStyle}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        onInit={(r) => onInit(nodes, edges, r)}
      />
    </Box>
  );
}
