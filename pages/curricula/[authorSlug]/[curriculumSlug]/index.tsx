import {
  Stack,
  Typography,
} from '@mui/material';
import { Edge, Node, ReactFlowProvider } from 'reactflow';
import useLocalStorageState from 'use-local-storage-state';
import NavigationBar from '../../../../components/NavigationBar';
import { listAuthors } from '../../../../src/Authors';
import { getCurriculum, Curriculum } from '../../../../src/Curricula';
import 'reactflow/dist/style.css';
import { curriculumPathname } from '../../../../src/urlUtils';
import CurriculumFlow from '../../../../components/CurriculumFlow';
import { METADATA_KEY, getDefaultMetadata } from '../../../../src/codeState';

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

export default function CurriculumPage({ curriculum }:
{ curriculum : Curriculum }) {
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

  return (
    <Stack spacing={2}>
      <NavigationBar />
      <Typography variant="h2" marginY={3} align="center">{curriculum.title}</Typography>
      <Typography variant="h5" marginY={3} align="center">{curriculum.description}</Typography>
      <ReactFlowProvider>
        <CurriculumFlow nodes={initialNodes} edges={initialEdges} />
      </ReactFlowProvider>
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
