import {
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useConfirm } from 'material-ui-confirm';
import { MDXRemote } from 'next-mdx-remote';
import Head from 'next/head';
import { useRef, useState } from 'react';
import AttributionInfo from '../../../../components/AttributionInfo';
import CurriculumFlow from '../../../../components/Curriculum/CurriculumFlow';
import InfoButton from '../../../../components/InfoButton';
import NavigationBar from '../../../../components/NavigationBar';
import ResetButton from '../../../../components/ResetButton';
import CentralContent from '../../../../components/Sidebar/CentralContent';
import CurriculumCompetenciesSidebar from '../../../../components/Sidebar/CurriculumCompetenciesSidebar';
import Sidebar from '../../../../components/Sidebar/Sidebar';
import TableOfContents from '../../../../components/Sidebar/TableOfContents';
import { getAuthorProfile, listAuthorsWithContent } from '../../../../src/fs-content/authors';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import useLocalProfile from '../../../../src/localStorage/useLocalProfile';
import { AuthorProfile } from '../../../../src/schemas/authorSchema';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { curriculumPathname } from '../../../../src/urlUtils';

export default function CurriculumPage({ curriculum, author }:
{ curriculum : Curriculum, author: AuthorProfile }) {
  const {
    metadata, setMetadata, findCurriculum, removeCurriculum,
  } = useLocalProfile();
  const curriculumFlowRef = useRef<HTMLDivElement>(null);
  const [nodesInitialized, setNodesInitialized] = useState(false);

  const curriculumStarted = findCurriculum(curriculum) !== -1;

  const confirm = useConfirm();

  const handleReset = () => {
    confirm({ description: 'You are about to reset the status of this curriculum. This will NOT affect the activities.', confirmationText: 'Ok, reset the curriculum' })
      .then(() => {
        removeCurriculum(curriculum);
      });
  };

  return (
    <>
      <Head>
        <title>{curriculum.title}</title>
      </Head>

      <NavigationBar>
        <ResetButton enabled={curriculumStarted} onReset={handleReset} tooltip="Reset Curriculum" />
        <InfoButton type="curriculum" authorSlug={curriculum.authorSlug} slug={curriculum.slug} />
      </NavigationBar>
      <Grid container>
        <Sidebar side="left">
          <CurriculumCompetenciesSidebar
            curriculum={curriculum}
            userActivities={metadata.activities}
          />
        </Sidebar>
        <CentralContent>
          <Stack spacing={2} alignItems="center">
            <Container maxWidth="md">
              <Typography variant="h3" marginY={3}>{curriculum.title}</Typography>
              <Typography variant="subtitle1" marginY={3}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <MDXRemote {...curriculum.description} />
              </Typography>
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
        </CentralContent>
        <Sidebar side="right">
          <TableOfContents elementRef={curriculumFlowRef} initialized={nodesInitialized} selector=".curriculum-unit[id]" title="In this curriculum" />
        </Sidebar>
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
