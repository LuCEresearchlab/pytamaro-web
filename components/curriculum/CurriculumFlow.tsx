import { Box } from '@mui/material';
import produce from 'immer';
import { NextRouter, useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect } from 'react';
import ReactFlow, {
  Edge,
  MarkerType,
  Node,
  ReactFlowProvider,
  useNodesInitialized,
} from 'reactflow';
import {
  Curriculum,
  CurriculumActivity,
  CurriculumUnit,
  curriculumToId,
} from '../../src/schemas/curriculumSchema';
import ActivityNode from './ActivityNode';
import JoinNode from './JoinNode';
import OptionalActivitiesNode from './OptionalActivitiesNode';
import TitleNode from './TitleNode';
import { ActivityNodeData, color } from './utils';

import 'reactflow/dist/style.css';
import { anchorName } from '../../src/curricula';
import { Metadata } from '../../src/localStorage/schema';
import scrollToAnchor from '../../src/scrollToAnchor';
import { activityVariantStatus } from '../ActivityStatusBadge';

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
  startend: TitleNode,
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
): Edge[] {
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
  curriculum: Curriculum,
  activities: CurriculumActivity[],
  metadata: Metadata,
  previousStepIsCompleted: boolean,
  allUnlocked: boolean,
  { width, height }: { width: number; height: number },
) {
  return activities.map((activity) => {
    const status = activityVariantStatus(
      metadata.activities,
      activity.variant,
      activity.fallbackIds,
    );
    const isUnlocked = previousStepIsCompleted || allUnlocked;
    return {
      id: activity.id,
      curriculumActivity: activity,
      curriculum,
      status,
      isUnlocked,
      width,
      height,
    };
  });
}

function graphWidth(
  titleWidth: number,
  activityWidth: number,
  units: CurriculumUnit[],
  layerSpacing: number,
) {
  const maxNumActivitiesInStep = Math.max(
    ...units.flatMap((u) => u.steps.flatMap((s) => s.activities.length)),
  );
  const maxStepWidth =
    maxNumActivitiesInStep * activityWidth +
    (maxNumActivitiesInStep - 1) * layerSpacing;
  return Math.max(maxStepWidth, titleWidth);
}

function getFlowElements(
  curriculum: Curriculum,
  metadata: Metadata,
  setMetadata: Dispatch<SetStateAction<Metadata>>,
  router: NextRouter,
  availableWidth: number,
) {
  const size = (perc: number, minValue: number, maxValue: number) =>
    Math.max(
      minValue,
      Math.min(availableWidth * perc, Math.min(availableWidth, maxValue)),
    );
  const nodeTypeDimensions = {
    activity: {
      width: size(0.28, 150, 350),
      height: size(0.25, 130, 260),
    },
    join: {
      width: size(0.02, 10, 20),
      height: size(0.02, 10, 20),
    },
    startend: {
      width: size(0.8, 300, 1000),
      height: size(0.04, 20, 40),
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
    curriculum.units,
    layerSpacing,
  );

  let bottom = 0;
  let nodesToBeConnected: string[] = [];
  const existingCurriculum = metadata.curricula.find(
    (c) => c.id === curriculumToId(curriculum),
  );
  const alreadyStarted = existingCurriculum !== undefined;
  const allUnlocked = alreadyStarted && curriculum.allActivitiesUnlocked;
  let previousStepIsCompleted = alreadyStarted;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const addNode = (
    id: string,
    type: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        id,
      },
      position: {
        x: xPos,
        y: bottom,
      },
      selectable,
    });
  };

  const reduceGapFromPreviousRow = (currentNodes: number) => {
    if (currentNodes === 1 && nodesToBeConnected.length === 1) {
      bottom -= layerSpacing * 0.4;
    }
  };

  const addIncomingEdges = (id: string) => {
    edges.push(
      ...incomingEdges(nodesToBeConnected, id, previousStepIsCompleted),
    );
  };

  const addSingleNode = (
    id: string,
    type: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    selectable = false,
  ) => {
    reduceGapFromPreviousRow(1);
    const dim = nodeTypeDimensions[type as keyof typeof nodeTypeDimensions];
    addNode(id, type, data, selectable, width / 2 - dim.width / 2);
    addIncomingEdges(id);
    nodesToBeConnected = [id];
    bottom += dim.height + layerSpacing;
  };

  const addActivitiesNodes = (
    unitIdx: number,
    stepIdx: number,
    activitiesData: ActivityNodeData[],
  ) => {
    const n = activitiesData.length;
    reduceGapFromPreviousRow(n);
    const dim = nodeTypeDimensions.activity;
    const rowWidth = n * dim.width;
    let gap = layerSpacing;
    if (n > 2) {
      gap *= 0.6;
    }
    if (n > 3) {
      gap *= 0.7;
    }
    const spacingWidth = (n - 1) * gap;
    const left = width / 2 - rowWidth / 2 - spacingWidth / 2;
    const ids = activitiesData.map((data, idx) => {
      const id = anchorName(unitIdx, stepIdx, idx);
      addNode(id, 'activity', data, true, left + idx * (dim.width + gap));
      addIncomingEdges(id);
      return id;
    });
    nodesToBeConnected = [...ids];
    bottom += dim.height + layerSpacing;
  };

  const handleCurriculumStart = () => {
    setMetadata((currentMetadata) =>
      produce(currentMetadata, (draft) => {
        draft.curricula.push({
          id: curriculumToId(curriculum),
        });
      }),
    );
  };

  const handleCurriculumEnd = () => {
    router.push(curriculum.finishURL);
  };

  // The curriculum graph contains:
  // - a start node
  addSingleNode(
    'start',
    'startend',
    {
      type: 'start',
      text: 'Start',
      unlocked: true,
      onStartClick: handleCurriculumStart,
      started: alreadyStarted,
    },
    !alreadyStarted,
  );
  // - a sequence of units
  curriculum.units.forEach((unit, unitIdx) => {
    // Each unit has a title
    addSingleNode(anchorName(unitIdx), 'title', {
      type: 'unit',
      text: unit.title,
      unlocked: allUnlocked || previousStepIsCompleted,
    });
    // and contains a sequence of steps
    unit.steps.forEach((step, stepIdx) => {
      const activitiesInfo = addActivitiesStatuses(
        curriculum,
        step.activities,
        metadata,
        previousStepIsCompleted,
        allUnlocked,
        nodeTypeDimensions.activity,
      );
      const currentStepIsCompleted = activitiesInfo.some(
        (a) => a.isUnlocked && a.status === 'completed',
      );
      const stepId = anchorName(unitIdx, stepIdx);
      // A step may be optional (shown as a single collapsed node)
      if (step.isOptional) {
        addSingleNode(
          stepId,
          'optional',
          {
            activityInfo: activitiesInfo,
            unlocked: allUnlocked || previousStepIsCompleted,
          },
          true,
        );
      } else {
        // or it consists of a set of alternative activities...
        // (which may be preceded by a "join" node when coming from a set of >1 alternatives)
        if (nodesToBeConnected.length > 1) {
          addSingleNode(
            stepId,
            'join',
            { unlocked: allUnlocked || previousStepIsCompleted },
            true,
          );
        }
        // ...shown in a single row
        addActivitiesNodes(unitIdx, stepIdx, activitiesInfo);
        previousStepIsCompleted = currentStepIsCompleted;
      }
    });
  });
  // - an end node
  addSingleNode(
    'end',
    'startend',
    {
      type: 'end',
      text: curriculum.finishLabel,
      unlocked: allUnlocked || previousStepIsCompleted,
      onEndClick: handleCurriculumEnd,
    },
    allUnlocked || previousStepIsCompleted,
  );

  return {
    nodes,
    edges,
    width,
    height: bottom,
  };
}

function Flow({
  nodes,
  edges,
  setNodesInitialized,
}: {
  nodes: Node[];
  edges: Edge[];
  setNodesInitialized: (initialized: boolean) => void;
}) {
  // Separate component, so we can use the hook
  const nodesInitialized = useNodesInitialized();
  useEffect(() => {
    setNodesInitialized(nodesInitialized);
    scrollToAnchor();
  }, [nodesInitialized, setNodesInitialized]);
  return (
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
  );
}

export default function CurriculumFlow({
  curriculum,
  metadata,
  setMetadata,
  setNodesInitialized,
  availableWidth,
}: {
  curriculum: Curriculum;
  metadata: Metadata;
  setMetadata: Dispatch<SetStateAction<Metadata>>;
  setNodesInitialized: (initialized: boolean) => void;
  availableWidth: number;
}) {
  const router = useRouter();
  const { nodes, edges, width, height } = getFlowElements(
    curriculum,
    metadata,
    setMetadata,
    router,
    availableWidth,
  );

  return (
    <Box
      style={{
        width,
        height,
      }}
    >
      <ReactFlowProvider>
        <Flow
          nodes={nodes}
          edges={edges}
          setNodesInitialized={setNodesInitialized}
        />
      </ReactFlowProvider>
    </Box>
  );
}
