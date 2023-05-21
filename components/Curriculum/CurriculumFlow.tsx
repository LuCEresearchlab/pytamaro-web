import {
  Box,
} from '@mui/material';
import ReactFlow, {
  Edge,
  Node,
} from 'reactflow';
import ActivityNode, { ActivityNodeData } from './ActivityNode';
import InfoNode from './InfoNode';
import TitleNode from './TitleNode';
import OptionalActivitiesNode from './OptionalActivitiesNode';
import JoinNode from './JoinNode';
import { CurriculumUnit } from '../../src/schemas/curriculumSchema';

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
  type: 'smoothstep',
  deletable: false,
  focusable: false,
  markerEnd: {
    type: 'arrow',
    height: 8,
    width: 8,
    strokeWidth: 2,
  },
  style: {
    strokeWidth: 10,
  },
};
const nodeTypes = {
  activity: ActivityNode,
  join: JoinNode,
  info: InfoNode,
  title: TitleNode,
  optional: OptionalActivitiesNode,
};
const nodeTypeDimensions = {
  activity: {
    width: 400,
    height: 400,
  },
  join: {
    width: 67,
    height: 67,
  },
  info: {
    width: 200,
    height: 67,
  },
  title: {
    width: 1000,
    height: 67,
  },
  optional: {
    width: 300,
    height: 67,
  },
};
const rfStyle = {
  backgroundColor: 'primary.main',
};

interface IncompleteEdge {
  source: string;
}

function getFlowElements(
  units: CurriculumUnit[],
  completedActivityVariantIds: string[],
  layerSpacing: number,
) {
  // calculate width
  const titleWidth = nodeTypeDimensions.title.width;
  const maxNumActivitiesInStep = Math.max(
    ...units.flatMap((u) => u.steps.flatMap((s) => s.activities.length)),
  );
  const maxStepWidth = maxNumActivitiesInStep * nodeTypeDimensions.activity.width
    + (maxNumActivitiesInStep - 1) * layerSpacing;
  const width = Math.max(maxStepWidth, titleWidth);

  let bottom = 0;
  let incompleteEdges = [] as IncompleteEdge[];
  let previousStepIsCompleted = true;
  const nodes = [] as Node[];
  const edges = [] as Edge[];

  let id = 'start';
  // push start node
  nodes.push({
    id,
    type: 'info',
    data: {
      ...nodeTypeDimensions.info,
      type: 'start',
    },
    position: {
      x: width / 2 - nodeTypeDimensions.info.width / 2,
      y: 0,
    },
  } as Node);
  // update variables
  bottom += nodeTypeDimensions.info.height + layerSpacing;
  incompleteEdges = [{
    source: id,
  }];

  units.forEach((unit, unitIdx) => {
    if (unit.title !== undefined) {
      id = `${unitIdx}`;
      // push unit-title node
      nodes.push({
        id,
        type: 'title',
        data: {
          ...nodeTypeDimensions.title,
          title: unit.title,
        },
        position: {
          x: width / 2 - nodeTypeDimensions.title.width / 2,
          y: bottom,
        },
      } as Node);
      // push in-edges
      edges.push(
        ...incompleteEdges.map((incompleteEdge, idx) => ({
          ...incompleteEdge,
          id: `${id}-in-edge-${idx}`,
          target: id,
        } as Edge)),
      );
      // update variables
      bottom += nodeTypeDimensions.title.height + layerSpacing;
      incompleteEdges = [{
        source: id,
      }];
    }
    unit.steps.forEach((step, stepIdx) => {
      let currentStepIsCompleted = false;
      const activityInfo = step.activities.map((activity) => {
        const isCompleted = completedActivityVariantIds.includes(activity.id);
        const isUnlocked = previousStepIsCompleted;
        currentStepIsCompleted = currentStepIsCompleted || (isCompleted && isUnlocked);
        return {
          ...nodeTypeDimensions.activity,
          id: activity.id,
          activity: activity.activity,
          isCompleted,
          isUnlocked,
        } as ActivityNodeData;
      });
      if (step.isOptional) {
        id = `optional-${unitIdx}-${stepIdx}`;
        // push optional node
        nodes.push({
          id,
          type: 'optional',
          data: {
            ...nodeTypeDimensions.optional,
            activityInfo,
          },
          position: {
            x: width / 2 - nodeTypeDimensions.optional.width / 2,
            y: bottom,
          },
        } as Node);
        // push in-edges
        edges.push(
          ...incompleteEdges.map((incompleteEdge, idx) => ({
            ...incompleteEdge,
            id: `${id}-in-edge-${idx}`,
            target: id,
          } as Edge)),
        );
        // update variables
        bottom += nodeTypeDimensions.optional.height + layerSpacing;
        incompleteEdges = [{
          source: id,
        }];
        return;
      }
      const numActivities = step.activities.length;
      if (incompleteEdges.length > 1 && numActivities > 1) {
        id = `${unitIdx}-${stepIdx}`;
        // push circle node
        nodes.push({
          id,
          type: 'join',
          data: nodeTypeDimensions.join,
          position: {
            x: width / 2 - nodeTypeDimensions.join.width / 2,
            y: bottom,
          },
        } as Node);
        // push in-edges
        edges.push(
          ...incompleteEdges.map((incompleteEdge, idx) => ({
            ...incompleteEdge,
            id: `${id}-in-edge-${idx}`,
            target: id,
          } as Edge)),
        );
        // update variables
        bottom += nodeTypeDimensions.join.height + layerSpacing;
        incompleteEdges = [{
          source: id,
        }];
      }
      const activityWidth = numActivities * nodeTypeDimensions.activity.width;
      const spacingWidth = (numActivities - 1) * layerSpacing;
      const left = width / 2 - activityWidth / 2 - spacingWidth / 2;
      const nextIncompleteEdges = [] as IncompleteEdge[];
      activityInfo.forEach((data, activityIdx) => {
        id = `${unitIdx}-${stepIdx}-${activityIdx}`;
        // push activity node
        nodes.push({
          id,
          type: 'activity',
          data,
          position: {
            x: left + activityIdx * (nodeTypeDimensions.activity.width + layerSpacing),
            y: bottom,
          },
        } as Node);
        // push in-edges
        edges.push(
          ...incompleteEdges.map((incompleteEdge, idx) => ({
            ...incompleteEdge,
            id: `${id}-in-edge-${idx}`,
            target: id,
          } as Edge)),
        );
        // update variables
        nextIncompleteEdges.push({
          source: id,
        });
      });
      // update variables
      bottom += nodeTypeDimensions.activity.height + layerSpacing;
      incompleteEdges = nextIncompleteEdges;
      previousStepIsCompleted = currentStepIsCompleted;
    });
  });
  id = 'end';
  // push end node
  nodes.push({
    id,
    type: 'info',
    data: {
      ...nodeTypeDimensions.info,
      type: 'end',
    },
    position: {
      x: width / 2 - nodeTypeDimensions.info.width / 2,
      y: bottom,
    },
  } as Node);
  // push in-edges
  edges.push(
    ...incompleteEdges.map((incompleteEdge, idx) => ({
      ...incompleteEdge,
      id: `${id}-in-edge-${idx}`,
      target: id,
    } as Edge)),
  );
  // update variables
  bottom += nodeTypeDimensions.info.height;
  return {
    nodes: nodes.map((node) => ({ ...nodeOptions, ...node } as Node)),
    edges: edges.map((edge) => ({ ...edgeOptions, ...edge } as Edge)),
    width,
    height: bottom,
  };
}

export default function CurriculumFlow({ units, completedActivityVariantIds }
: { units : CurriculumUnit[], completedActivityVariantIds : string[] }) {
  const {
    nodes, edges, width, height,
  } = getFlowElements(units, completedActivityVariantIds, 100);

  return (
    <Box
      style={{
        overflow: 'auto',
        maxWidth: '100%',
        width,
        alignSelf: 'center',
      }}
    >
      <Box
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
    </Box>
  );
}
