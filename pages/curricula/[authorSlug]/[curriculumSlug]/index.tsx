import {
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Head from 'next/head';
import { useRef, useState } from 'react';
import AttributionInfo from '../../../../components/AttributionInfo';
import CurriculumFlow from '../../../../components/Curriculum/CurriculumFlow';
import NavigationBar from '../../../../components/NavigationBar';
import TableOfContents from '../../../../components/TableOfContents';
import { getAuthorProfile, listAuthorsWithContent } from '../../../../src/fs-content/authors';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import useLocalProfile from '../../../../src/localStorage/useLocalProfile';
import { AuthorProfile } from '../../../../src/schemas/authorSchema';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { curriculumPathname } from '../../../../src/urlUtils';

export default function CurriculumPage({ curriculum, author }:
{ curriculum : Curriculum, author: AuthorProfile }) {
  const { metadata, setMetadata } = useLocalProfile();
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
                setMetadata={setMetadata}
                setNodesInitialized={setNodesInitialized}
              />
            </div>
            <Container maxWidth="md" sx={{ textAlign: 'center' }}>
              <Divider sx={{ mb: 3 }} />
              <AttributionInfo type="curriculum" author={author} derivedFrom={curriculum.derivedFrom} />
            </Container>
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
  const author = await getAuthorProfile(authorSlug);
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      author,
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
