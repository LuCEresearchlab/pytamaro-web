import {
  Stack,
  Typography,
} from '@mui/material';
import NavigationBar from '../../../../components/NavigationBar';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { curriculumPathname } from '../../../../src/urlUtils';
import listAuthors from '../../../../src/fs-content/authors';
import CurriculumFlow from '../../../../components/Curriculum/CurriculumFlow';

export default function CurriculumPage({ curriculum }:
{ curriculum : Curriculum }) {
  return (
    <Stack spacing={2}>
      <NavigationBar />
      <Typography variant="h2" marginY={3} align="center">{curriculum.title}</Typography>
      <Typography variant="h5" marginY={3} align="center">{curriculum.description}</Typography>
      <CurriculumFlow activities={curriculum.units[0].activities} />
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
    .flatMap((author) => author.curricula.map(
      (curriculum) => curriculumPathname(author.slug, curriculum.slug),
    ));
  return {
    paths,
    fallback: false,
  };
}
