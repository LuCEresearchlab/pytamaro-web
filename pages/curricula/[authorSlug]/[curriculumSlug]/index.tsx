import { Container, Divider, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { delay } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import { MDXRemote } from 'next-mdx-remote';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import AttributionInfo from '../../../../components/AttributionInfo';
import InfoButton from '../../../../components/InfoButton';
import NavigationBar from '../../../../components/NavigationBar';
import ResetButton from '../../../../components/ResetButton';
import CurriculumFlow from '../../../../components/curriculum/CurriculumFlow';
import CentralContent from '../../../../components/sidebar/CentralContent';
import CurriculumCompetenciesSidebar from '../../../../components/sidebar/CurriculumCompetenciesSidebar';
import Sidebar from '../../../../components/sidebar/Sidebar';
import TableOfContents from '../../../../components/sidebar/TableOfContents';
import ToolboxListSidebar from '../../../../components/sidebar/ToolboxListSidebar';
import {
  getAuthorProfile,
  listAuthorsWithContent,
} from '../../../../src/fs-content/authors';
import { getCurriculum } from '../../../../src/fs-content/curricula';
import useLocalProfile from '../../../../src/localStorage/useLocalProfile';
import { AuthorProfile } from '../../../../src/schemas/authorSchema';
import { Curriculum } from '../../../../src/schemas/curriculumSchema';
import { translationProps } from '../../../../src/serverSideTranslationProps';
import { curriculumPathname } from '../../../../src/urlUtils';

export default function CurriculumPage({
  curriculum,
  author,
}: {
  curriculum: Curriculum;
  author: AuthorProfile;
}) {
  const { metadata, setMetadata, findCurriculum, removeCurriculum } =
    useLocalProfile();
  const router = useRouter();
  const curriculumFlowRef = useRef<HTMLDivElement>(null);
  const [nodesInitialized, setNodesInitialized] = useState(false);

  const curriculumStarted = findCurriculum(curriculum) !== -1;

  const { width: mainContentWidth, ref: mainContentRef } = useResizeDetector();

  const confirm = useConfirm();

  const handleReset = () => {
    confirm({
      description:
        'You are about to reset the status of this curriculum. This will NOT affect the activities.',
      confirmationText: 'Ok, reset the curriculum',
    }).then(() => {
      removeCurriculum(curriculum);
    });
  };

  useEffect(() => {
    const toId = router.query.to;
    if (nodesInitialized && toId && typeof toId === 'string') {
      delay(() => {
        document.getElementById(toId)?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    }
  }, [nodesInitialized, router.query.to]);

  return (
    <>
      <Head>
        <title>{curriculum.title}</title>
      </Head>

      <NavigationBar>
        <ResetButton
          enabled={curriculumStarted}
          onReset={handleReset}
          tooltip='Reset Curriculum'
        />
        <InfoButton
          type='curriculum'
          authorSlug={curriculum.authorSlug}
          slug={curriculum.slug}
        />
      </NavigationBar>
      <Grid container>
        <Sidebar side='left'>
          <ToolboxListSidebar />
          <CurriculumCompetenciesSidebar curriculum={curriculum} />
        </Sidebar>
        <CentralContent>
          <Stack spacing={2} alignItems='center' ref={mainContentRef}>
            <Container maxWidth='md'>
              <Typography variant='h3' marginY={3}>
                {curriculum.title}
              </Typography>
              <Typography variant='subtitle1' marginY={3}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <MDXRemote {...curriculum.description} />
              </Typography>
            </Container>
            <div
              ref={curriculumFlowRef}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                overflowX: 'auto',
              }}
            >
              <CurriculumFlow
                curriculum={curriculum}
                metadata={metadata}
                setMetadata={setMetadata}
                setNodesInitialized={setNodesInitialized}
                availableWidth={mainContentWidth || 800}
              />
            </div>
            <Divider sx={{ mb: 3 }} />
            <Container maxWidth='md' sx={{ textAlign: 'center' }}>
              <AttributionInfo
                type='curriculum'
                author={author}
                derivedFrom={curriculum.derivedFrom}
              />
            </Container>
          </Stack>
        </CentralContent>
        <Sidebar side='right'>
          <TableOfContents
            elementRef={curriculumFlowRef}
            initialized={nodesInitialized}
            selector='.curriculum-unit[id]'
            titleKey='curriculum:inThisCurriculum'
          />
        </Sidebar>
      </Grid>
    </>
  );
}

export async function getStaticProps(context: {
  params: {
    authorSlug: string;
    curriculumSlug: string;
  };
}) {
  const { authorSlug, curriculumSlug } = context.params;
  const author = await getAuthorProfile(authorSlug);
  const curriculum = await getCurriculum(authorSlug, curriculumSlug);
  return {
    props: {
      author,
      curriculum,
      ...(await translationProps(['curriculum'])),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsWithContent();
  const paths = authors.flatMap((author) =>
    author.curricula.map((curriculum) =>
      curriculumPathname(author.slug, curriculum.slug),
    ),
  );
  return {
    paths,
    fallback: false,
  };
}
