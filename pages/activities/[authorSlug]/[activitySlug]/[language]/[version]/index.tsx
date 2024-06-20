import { Box, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import GithubSlugger from 'github-slugger';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import ActivityCodeCell from '../../../../../../components/ActivityCodeCell';
import ActivityFooter from '../../../../../../components/ActivityFooter';
import ActivityResetButton from '../../../../../../components/ActivityResetButton';
import DataSharingPreferenceDialog from '../../../../../../components/DataSharingPreferenceDialog';
import GoToCurriculaBanner from '../../../../../../components/GoToCurriculaBanner';
import InfoButton from '../../../../../../components/InfoButton';
import MarkdownCellComponent from '../../../../../../components/MarkdownCellComponent';
import NavigationBar from '../../../../../../components/NavigationBar';
import VariantSelector from '../../../../../../components/VariantSelector';
import ActivityCompetenciesSidebar from '../../../../../../components/sidebar/ActivityCompetenciesSidebar';
import ActivityImage from '../../../../../../components/sidebar/ActivityImage';
import CentralContent from '../../../../../../components/sidebar/CentralContent';
import CurriculumCompetenciesSidebar from '../../../../../../components/sidebar/CurriculumCompetenciesSidebar';
import CurriculumUnitSidebar from '../../../../../../components/sidebar/CurriculumUnitSidebar';
import Sidebar from '../../../../../../components/sidebar/Sidebar';
import TableOfContents from '../../../../../../components/sidebar/TableOfContents';
import ToolboxListSidebar from '../../../../../../components/sidebar/ToolboxListSidebar';
import { findIncludingCurricula } from '../../../../../../src/curricula';
import { findVersions, readActivity } from '../../../../../../src/fs-content/activities';
import { getAuthorProfile, listAuthorsWithContent, listCurriculaAllAuthors } from '../../../../../../src/fs-content/authors';
import { CodeCellState } from '../../../../../../src/localStorage/schema';
import useLocalTranslation from '../../../../../../src/localStorage/useLocalTranslation';
import getNotebookContent from '../../../../../../src/notebook';
import {
  Activity,
  ActivityVariant, MarkdownCell, NotebookCell,
  activityVariantId,
  getVariantTitle,
} from '../../../../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../../../../src/schemas/authorSchema';
import { Curriculum, curriculumToId } from '../../../../../../src/schemas/curriculumSchema';
import { translationProps } from '../../../../../../src/serverSideTranslationProps';
import { isSpecialActivity } from '../../../../../../src/specialActivities';
import { activityVariantPathnameFromParts } from '../../../../../../src/urlUtils';
import useCurriculumFromQuery from '../../../../../../src/useCurriculumFromQuery';
import useReset from '../../../../../../src/useReset';

const userType = 'student';

export default function NotebookPage({
  activity, author, activityVariant, cells, curricula,
}:
{ activity : Activity, author: AuthorProfile,
  activityVariant: ActivityVariant, cells: NotebookCell[], curricula: Curriculum[] }) {
  const initialCodeCells : CodeCellState[] = cells
    .map((cell, idx) => ({ cell, idx }))
    .filter(({ cell }) => cell.cell_type === 'code')
    .map(({ cell, idx: originalIdx }) => ({ source: cell.source, originalIndex: originalIdx }));
  const originalIdxToCodeCellIdx = new Map<number, number>();
  initialCodeCells.forEach((cell, idx) => originalIdxToCodeCellIdx.set(cell.originalIndex, idx));

  const cellsRef = useRef<HTMLDivElement>(null);

  const [fullWidthCell, setFullWidthCell] = useState(false);

  const curriculumId = useCurriculumFromQuery();
  const curriculum = curricula.find((c) => curriculumToId(c) === curriculumId);
  const title = getVariantTitle(activity, activityVariant);
  const pageTitle = `${title} - PyTamaro`;

  const { t } = useLocalTranslation(['common']);

  const { resetCounter, newReset } = useReset();

  const slugger = new GithubSlugger();

  // We need to keep track of this to render the table of content only after the
  // component has mounted.
  const [componentMounted, setComponentMounted] = useState(false);
  useEffect(() => {
    setComponentMounted(true);
  }, []);

  return (
    <div key={activityVariantId(activityVariant)}>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar>
          <VariantSelector
            activity={activity}
            activityVariant={activityVariant}
          />
          <ActivityResetButton
            initialCodeCells={initialCodeCells}
            activityVariant={activityVariant}
            newReset={newReset}
          />
          {!isSpecialActivity(activityVariant) && (
          <InfoButton type="activity" authorSlug={activity.authorSlug} slug={activity.slug} />
          )}
        </NavigationBar>
        <DataSharingPreferenceDialog />
        <Grid container>
          <Sidebar side="left">
            <ToolboxListSidebar />
            {curriculum && (
            <CurriculumCompetenciesSidebar curriculum={curriculum} />
            )}
          </Sidebar>
          <CentralContent>
            <Box ref={cellsRef} className="activity-content">
              <Container maxWidth="md">
                <Typography variant="h3" marginY={3}>{title}</Typography>
                {!curriculum && <GoToCurriculaBanner curricula={curricula} />}
              </Container>
              {cells.map((cell: NotebookCell, idx) => (cell.cell_type === 'markdown'
                ? (
                  <Container maxWidth="md" key={cell.id}>
                    <MarkdownCellComponent
                      slugger={slugger}
                      cell={cell as MarkdownCell}
                      activityVariant={activityVariant}
                    />
                  </Container>
                )
                : (
                  <Container maxWidth={fullWidthCell ? false : 'md'} key={cell.id}>
                    <ActivityCodeCell
                      activityVariant={activityVariant}
                      initialCodeCells={initialCodeCells}
                      cellIdx={originalIdxToCodeCellIdx.get(idx) as number}
                      extraPythonFiles={activity.extraPythonFiles}
                      fullWidthCell={fullWidthCell}
                      platformConfig={activity.platformConfig}
                      onFullWidthToggle={() => setFullWidthCell(!fullWidthCell)}
                      activityResetCounter={resetCounter}
                    />
                  </Container>
                )))}
            </Box>
            <Container maxWidth="md">
              {!isSpecialActivity(activityVariant) && (
              <ActivityFooter
                activityVariant={activityVariant}
                initialCodeCells={initialCodeCells}
                author={author}
                activity={activity}
                curriculum={curriculum}
              />
              )}
            </Container>
          </CentralContent>
          <Sidebar side="right">
            <ActivityImage activity={activity} variant={activityVariant} title={title} />
            {curriculum && (
              <CurriculumUnitSidebar curriculum={curriculum} activityVariant={activityVariant} />
            )}
            <TableOfContents initialized={componentMounted} elementRef={cellsRef} selector="h2[id], h3[id]" title={t('contents')} />
            {curriculum && (
              <ActivityCompetenciesSidebar
                curriculum={curriculum}
                activityVariant={activityVariant}
              />
            )}
          </Sidebar>
        </Grid>
      </Box>
    </div>
  );
}

export async function getStaticProps(
  context: { params: {
    authorSlug: string,
    activitySlug: string,
    language: string,
    version: string,
  }, defaultLocale: string, locales: string[] },
) {
  const {
    authorSlug, activitySlug, language, version,
  } = context.params;
  const activityVariant = {
    authorSlug, activitySlug, language, version,
  };
  return {
    props: {
      author: await getAuthorProfile(authorSlug),
      activity: await readActivity(authorSlug, activitySlug),
      activityVariant,
      cells: await getNotebookContent(authorSlug, activitySlug, language, version, userType),
      curricula: findIncludingCurricula(await listCurriculaAllAuthors(), activityVariant),
      ...await translationProps(['activityfooter', 'curriculum']),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsWithContent();
  const paths = authors
    .flatMap((author) => author.activities
      .flatMap((activity) => activity.variants
        .flatMap(
          async (notebook) => (await findVersions(author.slug, activity.slug, notebook.language))
            .map((v) => activityVariantPathnameFromParts(
              author.slug,
              activity.slug,
              notebook.language,
              v,
            )),
        )));
  return {
    paths: (await Promise.all(paths)).flat(),
    fallback: false,
  };
}
