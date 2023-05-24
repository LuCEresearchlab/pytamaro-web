import {
  Box,
} from '@mui/material';
import ReactFlow, {
  Edge,
  Node,
  MarkerType,
} from 'reactflow';
import ActivityNode from './ActivityNode';
import TitleNode from './TitleNode';
import OptionalActivitiesNode from './OptionalActivitiesNode';
import JoinNode from './JoinNode';
import { CurriculumActivity, CurriculumUnit } from '../../src/schemas/curriculumSchema';
import { ActivityNodeData, color } from './utils';

import 'reactflow/dist/style.css';
import useWidth from '../../src/useWidth';

const nodeOptions = {
  position: { x: 0, y: 0 },
  draggable: false,
  selectable: false,
  connectable: false,
  deletable: false,
  focusable: false,
};
const edgeOptions = {
  type: 'smoothstep',
  deletable: false,
  focusable: false,
  markerEnd: {
    type: MarkerType.Arrow,
    height: 6,
    width: 8,
    strokeWidth: 2,
  },
  style: {
    strokeWidth: 4,
  },
};
const nodeTypes = {
  activity: ActivityNode,
  join: JoinNode,
  title: TitleNode,
  optional: OptionalActivitiesNode,
};
const rfStyle = {
  backgroundColor: 'primary.main',
};

function incomingEdges(
  sourceNodeIds: string[],
  targetNodeId: string,
  highlighted: boolean,
) : Edge[] {
  return sourceNodeIds.map((sourceNodeId, idx) => ({
    ...edgeOptions,
    id: `${targetNodeId}-in-edge-${idx}`,
    source: sourceNodeId,
    target: targetNodeId,
    style: {
      ...edgeOptions.style,
      stroke: color(highlighted),
    },
    markerEnd: {
      ...edgeOptions.markerEnd,
      color: color(highlighted),
    },
  }));
}

function addActivitiesStatuses(
  activities: CurriculumActivity[],
  completedActivityVariantIds: string[],
  previousStepIsCompleted: boolean,
  { width, height }: { width: number, height: number },
) {
  return activities.map((activity) => {
    const isCompleted = completedActivityVariantIds.includes(activity.id);
    const isUnlocked = previousStepIsCompleted;
    return {
      id: activity.id,
      activity: activity.activity,
      isCompleted,
      isUnlocked,
      width,
      height,
    };
  });
}

function graphWidth(
  titleWidth : number,
  activityWidth : number,
  units: CurriculumUnit[],
  layerSpacing: number,
) {
  const maxNumActivitiesInStep = Math.max(
    ...units.flatMap((u) => u.steps.flatMap((s) => s.activities.length)),
  );
  const maxStepWidth = maxNumActivitiesInStep * activityWidth
    + (maxNumActivitiesInStep - 1) * layerSpacing;
  return Math.max(maxStepWidth, titleWidth);
}

function getFlowElements(
  units: CurriculumUnit[],
  completedActivityVariantIds: string[],
  windowWidth: number,
) {
  const size = (perc: number, minValue: number, maxValue: number) => Math.max(
    minValue,
    Math.min(windowWidth * perc, maxValue),
  );
  const nodeTypeDimensions = {
    activity: {
      width: size(0.22, 150, 350),
      height: size(0.2, 130, 260),
    },
    join: {
      width: size(0.02, 10, 20),
      height: size(0.02, 10, 20),
    },
    title: {
      width: size(0.8, 300, 1000),
      height: size(0.07, 30, 60),
    },
    optional: {
      width: size(0.2, 300, 400),
      height: size(0.07, 30, 60),
    },
  };
  const layerSpacing = size(0.15, 50, 90);
  const width = graphWidth(
    nodeTypeDimensions.title.width,
    nodeTypeDimensions.activity.width,
    units,
    layerSpacing,
  );

  let bottom = 0;
  let nodesToBeConnected : string[] = [];
  let previousStepIsCompleted = true;
  const nodes : Node[] = [];
  const edges : Edge[] = [];

  const addNode = (
    id: string,
    type: string,
    data: any,
    selectable: boolean,
    xPos: number,
  ) => {
    const dim = nodeTypeDimensions[type as keyof typeof nodeTypeDimensions];
    nodes.push({
      ...nodeOptions,
      id,
      type,
      data: {
        ...dim,
        ...data,
      },
      position: {
        x: xPos,
        y: bottom,
      },
      selectable,
    });
  };

  const addSingleNode = (
    id: string,
    type: string,
    data: any,
    selectable = false,
  ) => {
    const dim = nodeTypeDimensions[type as keyof typeof nodeTypeDimensions];
    addNode(id, type, data, selectable, width / 2 - dim.width / 2);
    edges.push(...incomingEdges(nodesToBeConnected, id, previousStepIsCompleted));
    nodesToBeConnected = [id];
    bottom += dim.height + layerSpacing;
  };

  const addActivitiesNodes = (
    idPrefix: string,
    activitiesData: ActivityNodeData[],
  ) => {
    const n = activitiesData.length;
    const dim = nodeTypeDimensions.activity;
    const rowWidth = n * dim.width;
    const spacingWidth = (n - 1) * layerSpacing;
    const left = width / 2 - rowWidth / 2 - spacingWidth / 2;
    const ids = activitiesData.map((data, idx) => {
      const id = `${idPrefix}-${idx}`;
      addNode(id, 'activity', data, true, left + idx * (dim.width + layerSpacing));
      edges.push(...incomingEdges(nodesToBeConnected, id, previousStepIsCompleted));
      return id;
    });
    nodesToBeConnected = [...ids];
    bottom += dim.height + layerSpacing;
  };

  // The curriculum graph contains:
  // - a start node
  addSingleNode('start', 'title', { type: 'start', text: 'Start', unlocked: previousStepIsCompleted });
  // - a sequence of units
  units.forEach((unit, unitIdx) => {
    // Each unit has a title
    addSingleNode(`${unitIdx}`, 'title', { type: 'unit', text: unit.title, unlocked: previousStepIsCompleted });
    // and contains a sequence of steps
    unit.steps.forEach((step, stepIdx) => {
      const activitiesInfo = addActivitiesStatuses(
        step.activities,
        completedActivityVariantIds,
        previousStepIsCompleted,
        nodeTypeDimensions.activity,
      );
      const currentStepIsCompleted = activitiesInfo.some((a) => a.isUnlocked && a.isCompleted);
      // A step may be optional (shown as a single collapsed node)
      if (step.isOptional) {
        addSingleNode(`optional-${unitIdx}-${stepIdx}`, 'optional', { activityInfo: activitiesInfo, unlocked: previousStepIsCompleted }, true);
      } else {
        // or it consists of a set of alternative activities...
        // (which may be preceded by a "join" node when coming from a set of >1 alternatives)
        if (nodesToBeConnected.length > 1) {
          addSingleNode(`join-${unitIdx}-${stepIdx}`, 'join', { unlocked: previousStepIsCompleted }, true);
        }
        // ...shown in a single row
        addActivitiesNodes(`${unitIdx}-${stepIdx}`, activitiesInfo);
        previousStepIsCompleted = currentStepIsCompleted;
      }
    });
  });
  // - an end node
  addSingleNode('end', 'title', { type: 'end', text: 'End', unlocked: previousStepIsCompleted });

  return {
    nodes,
    edges,
    width,
    height: bottom,
  };
}

export default function CurriculumFlow({ units, completedActivityVariantIds }
: { units : CurriculumUnit[], completedActivityVariantIds : string[] }) {
  const windowWidth = useWidth();
  const {
    nodes, edges, width, height,
  } = getFlowElements(units, completedActivityVariantIds, windowWidth);

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
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        />
      </Box>
    </Box>
  );
}
