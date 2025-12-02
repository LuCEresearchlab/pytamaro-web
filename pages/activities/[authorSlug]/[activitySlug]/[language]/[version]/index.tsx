import { Box, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import GithubSlugger from 'github-slugger';
import Head from 'next/head';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import ActivityCodeCell from '../../../../../../components/ActivityCodeCell';
import ActivityFooter from '../../../../../../components/ActivityFooter';
import ActivityResetButton from '../../../../../../components/ActivityResetButton';
import DataSharingPreferenceDialog from '../../../../../../components/DataSharingPreferenceDialog';
import GoToCurriculaBanner from '../../../../../../components/GoToCurriculaBanner';
import MarkdownCellComponent from '../../../../../../components/MarkdownCellComponent';
import InfoButton from '../../../../../../components/navbar/InfoButton';
import NavigationBar from '../../../../../../components/navbar/NavigationBar';
import ActivityCompetenciesSidebar from '../../../../../../components/sidebar/ActivityCompetenciesSidebar';
import ActivityImage from '../../../../../../components/sidebar/ActivityImage';
import CentralContent from '../../../../../../components/sidebar/CentralContent';
import CurriculumCompetenciesSidebar from '../../../../../../components/sidebar/CurriculumCompetenciesSidebar';
import CurriculumUnitSidebar from '../../../../../../components/sidebar/CurriculumUnitSidebar';
import Sidebar from '../../../../../../components/sidebar/Sidebar';
import TableOfContents from '../../../../../../components/sidebar/TableOfContents';
import ToolboxListSidebar from '../../../../../../components/sidebar/ToolboxListSidebar';
import VariantSelector from '../../../../../../components/VariantSelector';
import { findIncludingCurricula } from '../../../../../../src/curricula';
import {
  findVersions,
  readActivity,
} from '../../../../../../src/fs-content/activities';
import {
  getAuthorProfile,
  listAuthorsWithContent,
  listCurriculaAllAuthors,
} from '../../../../../../src/fs-content/authors';
import { CodeCellState } from '../../../../../../src/localStorage/schema';
import useLocalProfile from '../../../../../../src/localStorage/useLocalProfile';
import useMonacoColorizer from '../../../../../../src/monacoColorizer';
import getNotebookContent from '../../../../../../src/notebook';
import {
  Activity,
  ActivityVariant,
  MarkdownCell,
  NotebookCell,
  activityVariantId,
  getVariantTitle,
} from '../../../../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../../../../src/schemas/authorSchema';
import {
  Curriculum,
  curriculumToId,
} from '../../../../../../src/schemas/curriculumSchema';
import { translationProps } from '../../../../../../src/serverSideTranslationProps';
import { isSpecialActivity } from '../../../../../../src/specialActivities';
import { activityVariantPathnameFromParts } from '../../../../../../src/urlUtils';
import useCurriculumFromQuery from '../../../../../../src/useCurriculumFromQuery';
import useIsMounted from '../../../../../../src/useIsMounted';
import usePythonAnalyzer from '../../../../../../src/usePythonAnalyzer';
import useReset from '../../../../../../src/useReset';

const userType = 'student';

function NotebookCells({
  activity,
  initialCodeCells,
  activityVariant,
  cells,
  cellsRef,
  resetCounter,
  originalIdxToCodeCellIdx,
}: {
  activity: Activity;
  initialCodeCells: CodeCellState[];
  activityVariant: ActivityVariant;
  cells: NotebookCell[];
  cellsRef: RefObject<HTMLDivElement | null>;
  resetCounter: number;
  originalIdxToCodeCellIdx: Map<number, number>;
}) {
  const { metadata } = useLocalProfile();
  const { wideEditor } = metadata;
  const pythonAnalyzer = usePythonAnalyzer(activity.extraPythonFiles);
  const extraPythonFilesAnalysisResults = useMemo(() => {
    if (!pythonAnalyzer) {
      return [];
    }
    return activity.extraPythonFiles.map((file) => ({
      name: file.name,
      analysisResult: pythonAnalyzer.analyzeExtraPythonFile(file),
    }));
  }, [pythonAnalyzer, activity.extraPythonFiles]);
  useMonacoColorizer();

  return (
    <Box ref={cellsRef} className='activity-content'>
      {cells.map((cell, idx) =>
        cell.cell_type === 'markdown' ? (
          <Container maxWidth='md' key={cell.id}>
            <MarkdownCellComponent
              cell={cell as MarkdownCell}
              activityVariant={activityVariant}
              extraPythonFilesAnalysisResults={extraPythonFilesAnalysisResults}
            />
          </Container>
        ) : (
          <Container maxWidth={wideEditor ? false : 'md'} key={cell.id}>
            <ActivityCodeCell
              activityVariant={activityVariant}
              initialCodeCells={initialCodeCells}
              cellIdx={originalIdxToCodeCellIdx.get(idx) as number}
              extraPythonFiles={activity.extraPythonFiles}
              platformConfig={activity.platformConfig}
              activityResetCounter={resetCounter}
              pythonAnalyzer={pythonAnalyzer}
            />
          </Container>
        ),
      )}
    </Box>
  );
}

export default function NotebookPage({
  activity,
  author,
  activityVariant,
  cells,
  curricula,
}: {
  activity: Activity;
  author: AuthorProfile;
  activityVariant: ActivityVariant;
  cells: NotebookCell[];
  curricula: Curriculum[];
}) {
  const initialCodeCells: CodeCellState[] = cells
    .map((cell, idx) => ({ cell, idx }))
    .filter(({ cell }) => cell.cell_type === 'code')
    .map(({ cell, idx: originalIdx }) => ({
      source: cell.source,
      originalIndex: originalIdx,
    }));
  const originalIdxToCodeCellIdx = new Map<number, number>();
  initialCodeCells.forEach((cell, idx) =>
    originalIdxToCodeCellIdx.set(cell.originalIndex, idx),
  );

  const cellsRef = useRef<HTMLDivElement>(null);

  const curriculumId = useCurriculumFromQuery();
  const curriculum = curricula.find((c) => curriculumToId(c) === curriculumId);
  const title = getVariantTitle(activity, activityVariant);
  const pageTitle = `${title} - PyTamaro`;

  const { resetCounter, newReset } = useReset();

  const isMounted = useIsMounted();
  const [headingsReady, setHeadingsReady] = useState(false);

  useEffect(() => {
    if (isMounted) {
      const slugger = new GithubSlugger();
      const headings = cellsRef.current?.querySelectorAll(
        'h1, h2, h3, h4, h5, h6',
      );
      headings?.forEach((heading) => {
        // eslint-disable-next-line no-param-reassign
        heading.id = slugger.slug(heading.textContent || '');
      });
      setHeadingsReady(true);
    }
    return () => {
      setHeadingsReady(false);
    };
  }, [isMounted, cells]);

  return (
    <div key={activityVariantId(activityVariant)}>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar>
          <ActivityResetButton
            initialCodeCells={initialCodeCells}
            activityVariant={activityVariant}
            newReset={newReset}
          />
          <VariantSelector
            activity={activity}
            activityVariant={activityVariant}
          />
          {!isSpecialActivity(activityVariant) && (
            <InfoButton
              type='activity'
              authorSlug={activity.authorSlug}
              slug={activity.slug}
            />
          )}
        </NavigationBar>
        <DataSharingPreferenceDialog />
        <Grid container>
          <Sidebar side='left'>
            <ToolboxListSidebar />
            {curriculum && (
              <CurriculumCompetenciesSidebar curriculum={curriculum} />
            )}
          </Sidebar>
          <CentralContent>
            <Container maxWidth='md'>
              <Typography variant='h3' marginY={3}>
                {title}
              </Typography>
              {!curriculum && <GoToCurriculaBanner curricula={curricula} />}
            </Container>
            <NotebookCells
              activity={activity}
              initialCodeCells={initialCodeCells}
              activityVariant={activityVariant}
              cells={cells}
              cellsRef={cellsRef}
              resetCounter={resetCounter}
              originalIdxToCodeCellIdx={originalIdxToCodeCellIdx}
            />
            <Container maxWidth='md'>
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
          <Sidebar side='right'>
            <ActivityImage
              activity={activity}
              variant={activityVariant}
              title={title}
            />
            {curriculum && (
              <CurriculumUnitSidebar
                curriculum={curriculum}
                activityVariant={activityVariant}
              />
            )}
            <TableOfContents
              initialized={headingsReady}
              elementRef={cellsRef}
              selector='h2[id], h3[id]'
              titleKey='contents'
              activityVariant={activityVariant}
            />
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

export async function getStaticProps(context: {
  params: {
    authorSlug: string;
    activitySlug: string;
    language: string;
    version: string;
  };
  defaultLocale: string;
  locales: string[];
}) {
  const { authorSlug, activitySlug, language, version } = context.params;
  const activityVariant = {
    authorSlug,
    activitySlug,
    language,
    version,
  };
  return {
    props: {
      author: await getAuthorProfile(authorSlug),
      activity: await readActivity(authorSlug, activitySlug),
      activityVariant,
      cells: await getNotebookContent(
        authorSlug,
        activitySlug,
        language,
        version,
        userType,
      ),
      curricula: findIncludingCurricula(
        await listCurriculaAllAuthors(),
        activityVariant,
      ),
      ...(await translationProps(['activityfooter', 'curriculum'])),
    },
  };
}

export async function getStaticPaths() {
  const authors = await listAuthorsWithContent();
  const paths = authors.flatMap((author) =>
    author.activities.flatMap((activity) =>
      activity.variants.flatMap(async (notebook) =>
        (await findVersions(author.slug, activity.slug, notebook.language)).map(
          (v) =>
            activityVariantPathnameFromParts(
              author.slug,
              activity.slug,
              notebook.language,
              v,
            ),
        ),
      ),
    ),
  );
  return {
    paths: (await Promise.all(paths)).flat(),
    fallback: false,
  };
}
