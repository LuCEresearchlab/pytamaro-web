import {
  Box,
} from '@mui/material';
import { useCallback, useState } from 'react';
import ReactFlow, {
  Edge, Node, ReactFlowInstance, useReactFlow,
} from 'reactflow';
import dagre from 'dagre';
import ActivityNode from './ActivityNode';
import SumNode from './SumNode';
import UnitNode from './UnitNode';

import 'reactflow/dist/style.css';

const nodeTypes = {
  activity: ActivityNode,
  sum: SumNode,
  unit: UnitNode,
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
  r: ReactFlowInstance,
  direction = 'TB',
) {
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

  const isHorizontal = direction === 'LR';

  const nodeIds = [] as string[];
  nodes.forEach((node, idx) => {
    if (node.type === 'unit') {
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
    if (node.type === 'unit') {
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
    if (node.type === 'unit') {
      const { width, height } = groupDimensions[groupNodeIdx];
      groupNodeIdx += 1;
      return {
        ...node,
        width,
        height,
        data: {
          ...node,
          width,
          height,
        },
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

function getFlowDimensions(nodes: Node[]) {
  const dimensions = {
    width: 0,
    height: 0,
  };
  nodes.forEach((node) => {
    if (node.type === 'unit') {
      const right = node.position.x + (node.width || 0);
      const bottom = node.position.y + (node.height || 0);
      if (dimensions.width < right) {
        dimensions.width = right;
      }
      if (dimensions.height < bottom) {
        dimensions.height = bottom;
      }
    }
  });
  return dimensions;
}

export default function CurriculumFlow({ nodes, edges }
: { nodes : Node[], edges : Edge[] }) {
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(2000);
  const reactFlowInstance = useReactFlow();

  const layoutNodes = useCallback((r: ReactFlowInstance) => {
    const layoutedNodes = getLayoutedNodes(
      nodes,
      edges,
      r,
    );
    r.setNodes(layoutedNodes);
    setWidth(getFlowDimensions(layoutedNodes).width);
    setHeight(getFlowDimensions(layoutedNodes).height);
  }, [nodes, edges]);

  const collapseUnit = useCallback((event: React.MouseEvent, clickedNode: Node) => {
    if (clickedNode.type === 'unit') {
      const layoutedNodes = getLayoutedNodes(
        nodes,
        edges,
        reactFlowInstance,
      );
      // collapse
      const { isCollapsed } = clickedNode.data;
      let isInGroup = false;
      const nodeInGroupIds = [] as string[];
      const newNodes = layoutedNodes.map((node) => {
        if (clickedNode.id === node.id) {
          // group node to be collapsed
          isInGroup = true;
          return {
            ...node,
            data: {
              ...node.data,
              width: !isCollapsed ? 100 : node.style?.width,
              height: !isCollapsed ? 100 : node.style?.height,
              isCollapsed: !isCollapsed,
            },
            width: !isCollapsed ? 100 : node.style?.width,
            height: !isCollapsed ? 100 : node.style?.height,
            style: {
              ...node.style,
              width: !isCollapsed ? 100 : node.style?.width,
              height: !isCollapsed ? 100 : node.style?.height,
            },
          } as Node;
        }
        if (node.type === 'unit') {
          // another group node
          isInGroup = false;
          return node;
        }
        if (!isInGroup) {
          // activity node not in group to be collapsed
          return node;
        }
        // activity node in group to be collapsed
        nodeInGroupIds.push(node.id);
        return {
          ...node,
          hidden: !isCollapsed,
        };
      });
      const newEdges = edges.map((edge) => {
        if (nodeInGroupIds.includes(edge.source) || nodeInGroupIds.includes(edge.target)) {
          return {
            ...edge,
            hidden: !isCollapsed,
          };
        }
        return edge;
      });
      reactFlowInstance.setNodes(newNodes);
      reactFlowInstance.setEdges(newEdges);
      setWidth(getFlowDimensions(newNodes).width);
      setHeight(getFlowDimensions(newNodes).height);
    }
  }, [nodes, edges, reactFlowInstance]);

  return (
    <Box
      alignSelf="center"
      style={{
        width,
        height,
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
        onInit={layoutNodes}
        onNodeClick={collapseUnit}
      />
    </Box>
  );
}
