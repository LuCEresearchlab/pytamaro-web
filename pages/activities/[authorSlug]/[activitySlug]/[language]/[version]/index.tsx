import { Box, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Head from 'next/head';
import { useRef } from 'react';
import ActivityCodeCell from '../../../../../../components/ActivityCodeCell';
import ActivityFooter from '../../../../../../components/ActivityFooter';
import ActivityResetButton from '../../../../../../components/ActivityResetButton';
import DataSharingPreferenceDialog from '../../../../../../components/DataSharingPreferenceDialog';
import GoToCurriculaBanner from '../../../../../../components/GoToCurriculaBanner';
import InfoButton from '../../../../../../components/InfoButton';
import MarkdownCellComponent from '../../../../../../components/MarkdownCellComponent';
import NavigationBar from '../../../../../../components/NavigationBar';
import ActivityCompetenciesSidebar from '../../../../../../components/Sidebar/ActivityCompetenciesSidebar';
import ActivityImage from '../../../../../../components/Sidebar/ActivityImage';
import CentralContent from '../../../../../../components/Sidebar/CentralContent';
import CurriculumCompetenciesSidebar from '../../../../../../components/Sidebar/CurriculumCompetenciesSidebar';
import Sidebar from '../../../../../../components/Sidebar/Sidebar';
import TableOfContents from '../../../../../../components/Sidebar/TableOfContents';
import ToolboxListSidebar from '../../../../../../components/Sidebar/ToolboxListSidebar';
import VariantSelector from '../../../../../../components/VariantsSelector';
import { findIncludingCurricula } from '../../../../../../src/curricula';
import { findVersions, readActivity } from '../../../../../../src/fs-content/activities';
import { getAuthorProfile, listAuthorsWithContent, listCurriculaAllAuthors } from '../../../../../../src/fs-content/authors';
import { CodeCellState } from '../../../../../../src/localStorage/schema';
import getNotebookContent from '../../../../../../src/notebook';
import {
  Activity,
  ActivityVariant, MarkdownCell, NotebookCell,
  getVariantTitle,
} from '../../../../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../../../../src/schemas/authorSchema';
import { Curriculum, curriculumToId } from '../../../../../../src/schemas/curriculumSchema';
import { isSpecialActivity } from '../../../../../../src/specialActivities';
import { activityVariantPathnameFromParts } from '../../../../../../src/urlUtils';
import useCurriculumFromQuery from '../../../../../../src/useCurriculumFromQuery';

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

  const curriculumId = useCurriculumFromQuery();
  const curriculum = curricula.find((c) => curriculumToId(c) === curriculumId);
  const title = getVariantTitle(activity, activityVariant);
  const pageTitle = `${title} - PyTamaro`;

  return (
    <div>
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
            <Container maxWidth="md" ref={cellsRef}>
              <Typography variant="h3" marginY={3}>{title}</Typography>
              {!curriculum && <GoToCurriculaBanner curricula={curricula} />}
              {cells.map((cell: NotebookCell, idx) => (cell.cell_type === 'markdown'
                ? (
                  <MarkdownCellComponent
                    key={cell.id}
                    cell={cell as MarkdownCell}
                    activityVariant={activityVariant}
                  />
                )
                : (
                  <ActivityCodeCell
                    key={cell.id}
                    activityVariant={activityVariant}
                    initialCodeCells={initialCodeCells}
                    cellIdx={originalIdxToCodeCellIdx.get(idx) as number}
                    extraPythonFiles={activity.extraPythonFiles}
                  />
                )))}
            </Container>
            {!isSpecialActivity(activityVariant) && (
              <ActivityFooter
                activityVariant={activityVariant}
                initialCodeCells={initialCodeCells}
                author={author}
                activity={activity}
              />
            )}
          </CentralContent>
          <Sidebar side="right">
            <ActivityImage activity={activity} variant={activityVariant} title={title} />
            <TableOfContents initialized elementRef={cellsRef} selector="h2[id], h3[id]" title="Contents" />
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
  } },
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
