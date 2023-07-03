import {
  Alert,
  AlertTitle,
  Box, Divider, Stack, Typography,
} from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { isEqual } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import Head from 'next/head';
import { useRef } from 'react';
import AttributionInfo from '../../../../../../components/AttributionInfo';
import BackToCurriculum from '../../../../../../components/BackToCurriculum';
import CodeCell from '../../../../../../components/CodeCell';
import CodeDownloadButton from '../../../../../../components/CodeDownloadButton';
import DataSharingPreferenceDialog from '../../../../../../components/DataSharingPreferenceDialog';
import InfoButton from '../../../../../../components/InfoButton';
import MarkCompletedButton from '../../../../../../components/MarkCompletedButton';
import MarkdownCellComponent from '../../../../../../components/MarkdownCellComponent';
import MoreOptionsButton from '../../../../../../components/MoreOptionsButton';
import NavigationBar from '../../../../../../components/NavigationBar';
import NetworkErrorSnackbar from '../../../../../../components/NetworkErrorSnackbar';
import ResetButton from '../../../../../../components/ResetButton';
import SaveToToolboxButton from '../../../../../../components/SaveToToolboxButton';
import ActivityCompetenciesSidebar from '../../../../../../components/Sidebar/ActivityCompetenciesSidebar';
import ActivityImage from '../../../../../../components/Sidebar/ActivityImage';
import CentralContent from '../../../../../../components/Sidebar/CentralContent';
import CurriculumCompetenciesSidebar from '../../../../../../components/Sidebar/CurriculumCompetenciesSidebar';
import Sidebar from '../../../../../../components/Sidebar/Sidebar';
import TableOfContents from '../../../../../../components/Sidebar/TableOfContents';
import ToolboxListSidebar from '../../../../../../components/Sidebar/ToolboxListSidebar';
import VariantSelector from '../../../../../../components/VariantsSelector';
import { findVersions, readActivity } from '../../../../../../src/fs-content/activities';
import { getAuthorProfile, listAuthorsWithContent, listCurriculaAllAuthors } from '../../../../../../src/fs-content/authors';
import { CodeCellState, getDefaultActivityVariantMetadata } from '../../../../../../src/localStorage/schema';
import useLocalActivity from '../../../../../../src/localStorage/useLocalActivity';
import useLocalProfile from '../../../../../../src/localStorage/useLocalProfile';
import getNotebookContent from '../../../../../../src/notebook';
import {
  Activity,
  ActivityVariant, MarkdownCell, NotebookCell, activityVariantId, getVariantTitle,
} from '../../../../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../../../../src/schemas/authorSchema';
import { Curriculum, curriculumToId } from '../../../../../../src/schemas/curriculumSchema';
import { countLines } from '../../../../../../src/sourceUtils';
import { isSpecialActivity } from '../../../../../../src/specialActivities';
import { activityVariantPathnameFromParts } from '../../../../../../src/urlUtils';
import useCurriculumFromQuery from '../../../../../../src/useCurriculumFromQuery';

const userType = 'student';

function InconsistencyMessage() {
  return (
    <Alert severity="error">
      <AlertTitle>Inconsistency Detected</AlertTitle>
      <Typography>
        Code cells saved in your browser do not match the ones in the original notebook.
        This should not happen.
      </Typography>
      <Typography gutterBottom>
        Please send us a report using the feedback button.
      </Typography>
      {process.env.NODE_ENV === 'development' && (
      <Typography fontWeight="bold">
        If you are a content author, either increase the version number of this activity
        or delete the code previously saved in your browser using the reset button.
      </Typography>
      )}
    </Alert>
  );
}

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

  const {
    codeCells, codeExecutionStates, cellsModified,
    completed, networkError, localCodeCellsWrongLength, sourcesUpTo,
    toggleCompleted, setNetworkError, handleSourceChanged, handleExecute,
    handleToggleOutputArea, handleResetAllCellsNoConfirm, handleResetSingleCell,
  } = useLocalActivity(initialCodeCells, activityVariant);
  const cellsRef = useRef<HTMLDivElement>(null);

  const { metadata, getActivityMetadata, setActivityMetadata } = useLocalProfile();
  const currentMetadata = getActivityMetadata(activityVariant);
  const defaultMetadata = getDefaultActivityVariantMetadata(activityVariantId(activityVariant));
  const metadataModified = !isEqual(currentMetadata, defaultMetadata);

  const confirm = useConfirm();

  const handleGlobalReset = () => {
    confirm({ description: 'You are about to reset the entire activity, including all the code you have written. This action cannot be undone! ⚠️', confirmationText: 'Ok, delete my code' })
      .then(() => {
        handleResetAllCellsNoConfirm();
        setActivityMetadata(activityVariant, defaultMetadata);
      });
  };

  const curriculumId = useCurriculumFromQuery();
  const curriculum = curricula.find((c) => curriculumToId(c) === curriculumId);
  const title = getVariantTitle(activity, activityVariant);

  const pageTitle = `${title} - PyTamaro`;

  let nextFirstLineNumber = 1;

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
          <ResetButton enabled={cellsModified || metadataModified} onReset={handleGlobalReset} tooltip="Reset Activity" />
          {!isSpecialActivity(activityVariant) && (
          <InfoButton type="activity" authorSlug={activity.authorSlug} slug={activity.slug} />
          )}
        </NavigationBar>
        <NetworkErrorSnackbar visible={networkError} setVisible={setNetworkError} />
        <DataSharingPreferenceDialog />
        <Grid container>
          <Sidebar side="left">
            <ToolboxListSidebar />
            {curriculum && (
            <CurriculumCompetenciesSidebar
              curriculum={curriculum}
              userActivities={metadata.activities}
            />
            )}
          </Sidebar>
          <CentralContent>
            <Container maxWidth="md" ref={cellsRef}>
              <Typography variant="h3" marginY={3}>{title}</Typography>
              {localCodeCellsWrongLength
                ? <InconsistencyMessage />
                : cells.map((cell: NotebookCell, idx) => {
                  if (cell.cell_type === 'markdown') {
                    return (
                      <MarkdownCellComponent
                        key={cell.id}
                        cell={cell as MarkdownCell}
                        activityVariant={activityVariant}
                      />
                    );
                  }
                  const cellIdx = originalIdxToCodeCellIdx.get(idx) as number;
                  const currentCodeCell = codeCells[cellIdx];
                  const firstLineNumber = nextFirstLineNumber;
                  nextFirstLineNumber += countLines(currentCodeCell.source);
                  return (
                    <CodeCell
                      key={cell.id}
                      codeCellState={currentCodeCell}
                      codeCellExecutionState={codeExecutionStates[cellIdx]}
                      onSourceChanged={(newSource) => handleSourceChanged(newSource, cellIdx)}
                      onExecutionRequested={() => handleExecute(cellIdx)}
                      firstLineNumber={firstLineNumber}
                      activityVariant={activityVariant}
                      extraActions={(
                        <>
                          <SaveToToolboxButton
                            sources={sourcesUpTo(cellIdx)}
                            originalActivity={activityVariant}
                          />
                          <MoreOptionsButton
                            codeCellState={currentCodeCell}
                            codeCellExecutionState={codeExecutionStates[cellIdx]}
                            onShowHideOutput={() => handleToggleOutputArea(cellIdx)}
                            onReset={() => handleResetSingleCell(cellIdx)}
                          />
                        </>
                      )}
                    />
                  );
                })}
            </Container>
            {!isSpecialActivity(activityVariant) && (
              <>
                <Stack mt={12} mb={6} direction="row" justifyContent="center" spacing={4}>
                  <CodeDownloadButton codeCells={codeCells} />
                  <MarkCompletedButton completed={completed} toggleCompleted={toggleCompleted} />
                </Stack>
                <BackToCurriculum />
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                  <Divider sx={{ mb: 3 }} />
                  <AttributionInfo type="activity" author={author} derivedFrom={activity.derivedFrom} />
                </Container>
              </>
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
  return {
    props: {
      author: await getAuthorProfile(authorSlug),
      activity: await readActivity(authorSlug, activitySlug),
      activityVariant: {
        authorSlug, activitySlug, language, version,
      },
      cells: await getNotebookContent(authorSlug, activitySlug, language, version, userType),
      curricula: await listCurriculaAllAuthors(),
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
