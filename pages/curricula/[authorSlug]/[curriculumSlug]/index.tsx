import {
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../../../../components/NavigationBar';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { curriculumPathname } from '../../../../src/urlUtils';
import listAuthors from '../../../../src/fs-content/authors';
import CurriculumFlow from '../../../../components/Curriculum/CurriculumFlow';
import useLocalProfile from '../../../../src/localStorage/useLocalProfile';

export default function CurriculumPage({ curriculum }:
{ curriculum : Curriculum }) {
  const { metadata } = useLocalProfile();
  const completedActivityVariantIds = metadata.activities
    .filter((a) => a.completed)
    .map((a) => a.id);

  return (
    <>
      <Head>
        <title>{curriculum.title}</title>
      </Head>

      <Stack spacing={2} alignItems="center">
        <NavigationBar />
        <Container maxWidth="md">
          <Typography variant="h3" marginY={3}>{curriculum.title}</Typography>
          <Typography variant="subtitle1" marginY={3}>{curriculum.description}</Typography>
        </Container>
        <CurriculumFlow
          units={curriculum.units}
          completedActivityVariantIds={completedActivityVariantIds}
        />
      </Stack>
    </>
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
