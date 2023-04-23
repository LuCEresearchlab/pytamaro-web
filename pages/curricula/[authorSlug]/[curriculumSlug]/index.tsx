import {
  Stack,
  Typography,
  Box,
} from '@mui/material';
import ReactFlow, { NodeTypes } from 'reactflow';
import dagre from 'dagre';
import useLocalStorageState from 'use-local-storage-state';
import NavigationBar from '../../../../components/NavigationBar';
import { listAuthors } from '../../../../src/Authors';
import { getCurriculum, Curriculum, CurriculumActivityId } from '../../../../src/Curricula';
import { METADATA_KEY, getDefaultMetadata } from '../../../../src/codeState';
import ActivityNode from '../../../../components/ActivityNode';
import SumNode from '../../../../components/SumNode';
import 'reactflow/dist/style.css';
import { curriculumPathname } from '../../../../src/urlUtils';

const nodeTypes: NodeTypes = { activity: ActivityNode, sum: SumNode };

const rfStyle = {
  backgroundColor: '#B8CEFF',
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

function getDimensions(type: string) {
  return type === 'activity'
    ? {
      width: 400,
      height: 400,
    }
    : {
      width: 100,
      height: 100,
    };
}

// https://reactflow.dev/docs/examples/layout/dagre/
function getLayoutedElements(nodes: any, edges: any, direction = 'TB') {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node: any) => {
    dagreGraph.setNode(node.id, getDimensions(node.type));
  });

  edges.forEach((edge: any) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node: any) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - getDimensions(node.type).width / 2,
        y: nodeWithPosition.y - getDimensions(node.type).height / 2,
      },
      ...node,
    };
  });

  return { nodes: newNodes, edges };
}

export default function CurriculumPage({
  curriculum,
}:
{ curriculum : Curriculum }) {
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
  const initialNodes = curriculum.activities.flatMap(
    (a) => {
      const activityNodeId = JSON.stringify(a.id);
      const isCompleted = completedActivityVariantIds.includes(activityNodeId);
      const isAvailable = a.activityRequirements.every(
        (asum) => asum.some(
          (aterm) => completedActivityVariantIds.includes(JSON.stringify(aterm)),
        ),
      );
      return [
        {
          id: activityNodeId,
          type: 'activity',
          data: {
            authorSlug: a.id.authorSlug,
            activity: a.activity,
            variant: a.variant,
            isCompleted,
            isAvailable,
          },
        },
        ...a.activityRequirements.flatMap(
          (asum, sumIndex) => {
            if (asum.length > 1) {
              return {
                id: `${activityNodeId}-sum-${sumIndex}`,
                type: 'sum',
              };
            }
            return [];
          },
        ),
      ];
    },
  );
  // get edges
  const initialEdges = curriculum.activities.flatMap(
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
              },
              ...asum.map(
                (aterm, termIndex) => ({
                  id: `${activityNodeId}-edge-${sumIndex}-${termIndex}`,
                  source: JSON.stringify(aterm),
                  target: `${activityNodeId}-sum-${sumIndex}`,
                }),
              ),
            ];
          }
          if (asum.length === 1) {
            return {
              id: `${activityNodeId}-edge-${sumIndex}`,
              source: JSON.stringify(asum[0]),
              target: `${activityNodeId}`,
            };
          }
          // asum.length === 0
          return [];
        },
      );
    },
  );
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges,
  );

  return (
    <Stack spacing={2}>
      <NavigationBar />
      <Typography variant="h2" marginY={3} align="center">{curriculum.title}</Typography>
      <Box style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={layoutedNodes}
          edges={layoutedEdges}
          nodeTypes={nodeTypes}
          fitView
          style={rfStyle}
        />
      </Box>
    </Stack>
  );
}

export async function getStaticProps(
  context: { params: {
    authorSlug: string,
    curriculumSlug: string,
  } },
) {
  const {
    authorSlug, curriculumSlug,
  } = context.params;
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      curriculum,
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthors();
  const paths = authors
    .flatMap((author) => author.curricula
      .map((curriculum) => curriculumPathname(author.slug, curriculum.slug)));
  return {
    paths,
    fallback: false,
  };
}
