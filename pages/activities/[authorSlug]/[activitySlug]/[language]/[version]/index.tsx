import { Box, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import GithubSlugger from 'github-slugger';
import Head from 'next/head';
import {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import useMonacoColorizer from '../../../../../../src/editor/colorizer';
import { ExecutorContext } from '../../../../../../src/execution/executorContext';
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
import useLocalActivity, {
  type LocalActivityState,
} from '../../../../../../src/localStorage/useLocalActivity';
import useLocalProfile from '../../../../../../src/localStorage/useLocalProfile';
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
import useReset from '../../../../../../src/useReset';

const userType = 'student';

function sanitizeIframes() {
  const supportsCredentialless =
    'credentialless' in HTMLIFrameElement.prototype;
  const iframesOnPage = document.querySelectorAll('iframe');
  iframesOnPage.forEach((iframe) => {
    if (supportsCredentialless) {
      iframe.setAttribute('credentialless', '');
      // Force reload of the iframe to apply the new attribute
      // eslint-disable-next-line no-param-reassign
      iframe.src = iframe.src;
    } else {
      // If the browser does not support credentialless iframes, replace the
      // iframe with a message and a link to open it in a new tab.
      // Unfortunately, it's hard to localize this message because we are doing
      // manual DOM manipulation here, outside React.
      const altElem = document.createElement('p');
      altElem.innerHTML =
        '<i>Some external content cannot be displayed directly on this page. ' +
        'View it on a <a href=' +
        iframe.src +
        ' target="_blank" rel="noopener noreferrer">separate page</a>.</i>';
      iframe.replaceWith(altElem);
    }
  });
}

function sanitizeImgs() {
  document.querySelectorAll('img').forEach((img) => {
    img.setAttribute('crossOrigin', 'anonymous');
  });
}

function NotebookCells({
  activity,
  activityState,
  activityVariant,
  cells,
  cellsRef,
  resetCounter,
  originalIdxToCodeCellIdx,
  runEnabled,
}: {
  activity: Activity;
  activityState: LocalActivityState;
  activityVariant: ActivityVariant;
  cells: NotebookCell[];
  cellsRef: RefObject<HTMLDivElement | null>;
  resetCounter: number;
  originalIdxToCodeCellIdx: Map<number, number>;
  runEnabled: boolean;
}) {
  const { metadata } = useLocalProfile();
  const { wideEditor } = metadata;
  const activitySession = activityState.activitySession;
  const extraPythonFilesAnalysisResults = useMemo(() => {
    return activitySession.analyzeExtraPythonFiles(activity.extraPythonFiles);
  }, [activitySession, activity.extraPythonFiles]);
  useMonacoColorizer();

  useEffect(() => {
    const runSanitizers = () => {
      sanitizeIframes();
      sanitizeImgs();
    };

    if (document.readyState === 'complete') {
      runSanitizers();
    } else {
      window.addEventListener('load', runSanitizers, { once: true });
    }

    return () => {
      window.removeEventListener('load', runSanitizers);
    };
  }, []);

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
              activityState={activityState}
              activityVariant={activityVariant}
              cellIdx={originalIdxToCodeCellIdx.get(idx) as number}
              extraPythonFiles={activity.extraPythonFiles}
              platformConfig={activity.platformConfig}
              activityResetCounter={resetCounter}
              runEnabled={runEnabled}
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

  const activityState = useLocalActivity(
    initialCodeCells,
    activityVariant,
    activity.extraPythonFiles,
  );

  const [headingsVersion, setHeadingsVersion] = useState(0);
  const [headingsReady, setHeadingsReady] = useState(false);

  useEffect(() => {
    const slugHeadingsAndMarkAsInitialized = () => {
      const slugger = new GithubSlugger();
      if (!cellsRef.current) {
        return;
      }
      const headings = cellsRef.current.querySelectorAll(
        'h1, h2, h3, h4, h5, h6',
      );
      headings.forEach((heading) => {
        // eslint-disable-next-line no-param-reassign
        heading.id = slugger.slug(heading.textContent ?? '');
      });
      setHeadingsReady(true);
      setHeadingsVersion((v) => v + 1);
    };
    const observer = new MutationObserver(slugHeadingsAndMarkAsInitialized);
    if (cellsRef.current) {
      slugHeadingsAndMarkAsInitialized();
      observer.observe(cellsRef.current, {
        childList: true,
      });
    }
    return () => {
      setHeadingsReady(false);
      observer.disconnect();
    };
  }, [cells]);

  const { executorState } = useContext(ExecutorContext);

  return (
    <div key={activityVariantId(activityVariant)}>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar>
          <ActivityResetButton
            activityState={activityState}
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
              <Typography
                variant='h3'
                sx={{
                  marginY: 3,
                }}
              >
                {title}
              </Typography>
              {!curriculum && <GoToCurriculaBanner curricula={curricula} />}
            </Container>
            <NotebookCells
              activity={activity}
              activityState={activityState}
              activityVariant={activityVariant}
              cells={cells}
              cellsRef={cellsRef}
              resetCounter={resetCounter}
              originalIdxToCodeCellIdx={originalIdxToCodeCellIdx}
              runEnabled={executorState.type == 'available'}
            />
            <Container maxWidth='md'>
              {!isSpecialActivity(activityVariant) && (
                <ActivityFooter
                  activityState={activityState}
                  activityVariant={activityVariant}
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
              key={headingsVersion}
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
