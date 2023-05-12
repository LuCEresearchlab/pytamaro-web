import {
  Box,
} from '@mui/material';
import { useEffect, useState } from 'react';
import ReactFlow, {
  Edge, Node,
} from 'reactflow';
import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs';
import useLocalStorageState from 'use-local-storage-state';
import ActivityNode from './ActivityNode';
import SumNode from './SumNode';
import UnitNode from './UnitNode';
import { CurriculumActivity } from '../../src/schemas/curriculumSchema';
import { METADATA_KEY, getDefaultMetadata } from '../../src/localStorage/schema';

import 'reactflow/dist/style.css';

const nodeOptions = {
  position: { x: 0, y: 0 },
  draggable: false,
  selectable: true,
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
const nodeTypes = {
  activity: ActivityNode,
  sum: SumNode,
  unit: UnitNode,
};
const nodeTypeDimensions = {
  activity: {
    width: 400,
    height: 400,
  },
  sum: {
    width: 67,
    height: 67,
  },
};
const rfStyle = {
  backgroundColor: 'primary.main',
};

function activitiesToElkNodes(activities: CurriculumActivity[]) {
  return activities.flatMap(
    (a) => {
      const activityNodeId = a.id;
      return [
        {
          id: activityNodeId,
          width: nodeTypeDimensions.activity.width,
          height: nodeTypeDimensions.activity.height,
        } as ElkNode,
        ...a.activityRequirements.flatMap(
          (asum, sumIndex) => {
            if (asum.length > 1) {
              return {
                id: `${activityNodeId}-sum-${sumIndex}`,
                width: nodeTypeDimensions.sum.width,
                height: nodeTypeDimensions.sum.height,
              } as ElkNode;
            }
            return [];
          },
        ),
      ];
    },
  );
}

function activitiesToElkEdges(activities: CurriculumActivity[]) {
  return activities.flatMap(
    (a) => {
      const activityNodeId = a.id;
      return a.activityRequirements.flatMap(
        (asum, sumIndex) => {
          if (asum.length > 1) {
            return [
              {
                id: `${activityNodeId}-edge-${sumIndex}`,
                sources: [`${activityNodeId}-sum-${sumIndex}`],
                targets: [activityNodeId],
              } as ElkExtendedEdge,
              ...asum.map(
                (aterm, termIndex) => ({
                  id: `${activityNodeId}-edge-${sumIndex}-${termIndex}`,
                  sources: [aterm],
                  targets: [`${activityNodeId}-sum-${sumIndex}`],
                } as ElkExtendedEdge),
              ),
            ];
          }
          if (asum.length === 1) {
            return {
              id: `${activityNodeId}-edge-${sumIndex}`,
              sources: [asum[0]],
              targets: [activityNodeId],
            } as ElkExtendedEdge;
          }
          // asum.length === 0
          return [];
        },
      );
    },
  );
}

async function layoutElkElements(elkNodes: ElkNode[], elkEdges: ElkExtendedEdge[]) {
  const elk = new ELK();
  const graph : ElkNode = {
    id: 'root',
    children: elkNodes,
    edges: elkEdges,
    layoutOptions: {
      'spacing.nodeNodeBetweenLayers': '100',
      'elk.direction': 'DOWN',
      'org.eclipse.elk.algorithm': 'org.eclipse.elk.layered',
      'org.eclipse.elk.spacing.nodeNode': '100',
      'org.eclipse.elk.layered.allowNonFlowPortsToSwitchSides': 'true',
    },
  };
  const newGraph = await elk.layout(graph);
  const {
    width, height, children: nodes, edges,
  } = newGraph;
  return {
    width: width || 0,
    height: height || 0,
    nodes: nodes || [],
    edges: edges || [],
  };
}

function createFlowElements(
  activities: CurriculumActivity[],
  elkNodes: ElkNode[],
  elkEdges: ElkExtendedEdge[],
  completedActivityVariantIds: string[],
) {
  const nodes = elkNodes.map(
    (elkNode) => {
      const curriculumAct = activities.find((a) => a.id === elkNode.id);
      if (!curriculumAct) {
        return {
          ...nodeOptions,
          id: elkNode.id,
          type: 'sum',
          data: nodeTypeDimensions.sum,
          position: {
            x: elkNode.x,
            y: elkNode.y,
          },
        } as Node;
      }
      const isCompleted = completedActivityVariantIds.includes(curriculumAct.id);
      const isUnlocked = curriculumAct.activityRequirements.every(
        (asum) => asum.some(
          (aterm) => completedActivityVariantIds.includes(aterm),
        ),
      );
      return {
        ...nodeOptions,
        id: elkNode.id,
        type: 'activity',
        data: {
          id: curriculumAct.id,
          activity: curriculumAct.activity,
          variant: curriculumAct.variant,
          isCompleted,
          isUnlocked,
          width: nodeTypeDimensions.activity.width,
          height: nodeTypeDimensions.activity.height,
        },
        position: {
          x: elkNode?.x,
          y: elkNode?.y,
        },
      } as Node;
    },
  );
  const edges = elkEdges.map(
    (elkEdge) => ({
      ...edgeOptions,
      id: elkEdge.id,
      source: elkEdge.sources[0],
      target: elkEdge.targets[0],
    } as Edge),
  );
  return {
    nodes,
    edges,
  };
}

export default function CurriculumFlow({ activities }: { activities : CurriculumActivity[] }) {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [nodes, setNodes] = useState([] as Node[]);
  const [edges, setEdges] = useState([] as Edge[]);
  const [metadata] = useLocalStorageState(METADATA_KEY, {
    defaultValue: getDefaultMetadata(),
  });
  const completedActivityVariantIds = metadata.activities
    .filter((a) => a.completed)
    .map((a) => a.id);

  useEffect(() => {
    const setFlowElements = async () => {
      const elkNodes = activitiesToElkNodes(activities);
      const elkEdges = activitiesToElkEdges(activities);
      const {
        width: newWidth,
        height: newHeight,
        nodes: newElkNodes,
        edges: newElkEdges,
      } = await layoutElkElements(elkNodes, elkEdges);
      setWidth(newWidth);
      setHeight(newHeight);
      const {
        nodes: newNodes,
        edges: newEdges,
      } = createFlowElements(activities, newElkNodes, newElkEdges, completedActivityVariantIds);
      console.log(newWidth);
      console.log(newHeight);
      console.log(newNodes);
      console.log(newEdges);
      setNodes(newNodes);
      setEdges(newEdges);
    };
    if (nodes.length === 0) {
      setFlowElements();
    }
  }, [nodes, activities, completedActivityVariantIds]);

  return (
    <Box
      alignSelf="center"
      style={{
        width,
        height,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        style={rfStyle}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      />
    </Box>
  );
}
