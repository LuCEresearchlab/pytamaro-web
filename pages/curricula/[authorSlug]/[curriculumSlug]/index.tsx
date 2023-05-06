import {
  Stack,
  Typography,
} from '@mui/material';
import { ReactFlowProvider } from 'reactflow';
import NavigationBar from '../../../../components/NavigationBar';
import { listAuthors } from '../../../../src/Authors';
import { getCurriculum, Curriculum } from '../../../../src/Curricula';
import 'reactflow/dist/style.css';
import { curriculumPathname } from '../../../../src/urlUtils';
import CurriculumFlow from '../../../../components/CurriculumFlow';

export default function CurriculumPage({ curriculum }:
{ curriculum : Curriculum }) {
  return (
    <Stack spacing={2}>
      <NavigationBar />
      <Typography variant="h2" marginY={3} align="center">{curriculum.title}</Typography>
      <Typography variant="h5" marginY={3} align="center">{curriculum.description}</Typography>
      <ReactFlowProvider>
        <CurriculumFlow curriculum={curriculum} />
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
