import {
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Head from 'next/head';
import { useRef, useState } from 'react';
import CurriculumFlow from '../../../../components/Curriculum/CurriculumFlow';
import NavigationBar from '../../../../components/NavigationBar';
import TableOfContents from '../../../../components/TableOfContents';
import { listAuthorsWithContent } from '../../../../src/fs-content/authors';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import useLocalProfile from '../../../../src/localStorage/useLocalProfile';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { curriculumPathname } from '../../../../src/urlUtils';

export default function CurriculumPage({ curriculum }:
{ curriculum : Curriculum }) {
  const { metadata } = useLocalProfile();
  const curriculumFlowRef = useRef<HTMLDivElement>(null);
  const [nodesInitialized, setNodesInitialized] = useState(false);

  return (
    <>
      <Head>
        <title>{curriculum.title}</title>
      </Head>

      <NavigationBar />
      <Grid container>
        <Grid
          lg={2}
          sx={{
            display: {
              xs: 'none', sm: 'none', md: 'none', lg: 'block',
            },
          }}
        />
        <Grid xs={12} lg={8}>
          <Stack spacing={2} alignItems="center">
            <Container maxWidth="md">
              <Typography variant="h3" marginY={3}>{curriculum.title}</Typography>
              <Typography variant="subtitle1" marginY={3}>{curriculum.description}</Typography>
            </Container>
            <div ref={curriculumFlowRef}>
              <CurriculumFlow
                curriculum={curriculum}
                metadata={metadata}
                setNodesInitialized={setNodesInitialized}
              />
            </div>
          </Stack>
        </Grid>
        <Grid
          lg={2}
          sx={{
            display: {
              xs: 'none', sm: 'none', md: 'none', lg: 'block',
            },
          }}
        >
          <TableOfContents elementRef={curriculumFlowRef} initialized={nodesInitialized} selector=".curriculum-unit[id]" title="In this curriculum" />
        </Grid>
      </Grid>
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
  const authors = await listAuthorsWithContent();
  const paths = authors
    .flatMap((author) => author.curricula.map(
      (curriculum) => curriculumPathname(author.slug, curriculum.slug),
    ));
  return {
    paths,
    fallback: false,
  };
}
