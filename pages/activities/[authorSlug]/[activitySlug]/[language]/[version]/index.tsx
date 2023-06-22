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
import ActivityInfoButton from '../../../../../../components/ActivityInfoButton';
import AttributionInfo from '../../../../../../components/AttributionInfo';
import BackToCurriculum from '../../../../../../components/BackToCurriculum';
import CodeCell from '../../../../../../components/CodeCell';
import CodeDownloadButton from '../../../../../../components/CodeDownloadButton';
import DataSharingPreferenceDialog from '../../../../../../components/DataSharingPreferenceDialog';
import LeftSidebar from '../../../../../../components/LeftSidebar';
import MarkCompletedButton from '../../../../../../components/MarkCompletedButton';
import MarkdownCellComponent from '../../../../../../components/MarkdownCellComponent';
import MoreOptionsButton from '../../../../../../components/MoreOptionsButton';
import NavigationBar from '../../../../../../components/NavigationBar';
import NetworkErrorSnackbar from '../../../../../../components/NetworkErrorSnackbar';
import ResetButton from '../../../../../../components/ResetButton';
import SaveToToolboxButton from '../../../../../../components/SaveToToolboxButton';
import TableOfContents from '../../../../../../components/TableOfContents';
import VariantSelector from '../../../../../../components/VariantsSelector';
import { findVersions, readActivity } from '../../../../../../src/fs-content/activities';
import { getAuthorProfile, listAuthorsWithContent } from '../../../../../../src/fs-content/authors';
import { CodeCellState, getDefaultActivityVariantMetadata } from '../../../../../../src/localStorage/schema';
import useLocalActivity from '../../../../../../src/localStorage/useLocalActivity';
import useLocalProfile from '../../../../../../src/localStorage/useLocalProfile';
import getNotebookContent from '../../../../../../src/notebook';
import {
  Activity,
  ActivityVariant, MarkdownCell, NotebookCell, activityVariantId,
} from '../../../../../../src/schemas/activitySchema';
import { AuthorProfile } from '../../../../../../src/schemas/authorSchema';
import { countLines } from '../../../../../../src/sourceUtils';
import { activityVariantPathnameFromParts } from '../../../../../../src/urlUtils';

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
  activity, author, activityVariant, cells,
}:
{ activity : Activity, author: AuthorProfile,
  activityVariant: ActivityVariant, cells: NotebookCell[] }) {
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

  const { getActivityMetadata, setActivityMetadata } = useLocalProfile();
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

  const title = activity.languagesInfo.find((i) => i.language === activityVariant.language)?.title;

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
          <ResetButton enabled={cellsModified || metadataModified} onReset={handleGlobalReset} />
          <ActivityInfoButton authorSlug={activity.authorSlug} activitySlug={activity.slug} />
        </NavigationBar>
        <NetworkErrorSnackbar visible={networkError} setVisible={setNetworkError} />
        <DataSharingPreferenceDialog />
        <Grid container>
          <Grid
            lg={2}
            sx={{
              display: {
                xs: 'none', sm: 'none', md: 'none', lg: 'block',
              },
            }}
          >
            <LeftSidebar />
          </Grid>
          <Grid xs={12} lg={8}>
            <Container maxWidth="md" ref={cellsRef}>
              <Typography variant="h3" marginTop={2}>{title}</Typography>
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
            <Stack mt={12} mb={6} direction="row" justifyContent="center" spacing={4}>
              <CodeDownloadButton codeCells={codeCells} />
              <MarkCompletedButton completed={completed} toggleCompleted={toggleCompleted} />
            </Stack>
            <BackToCurriculum />
            <Container maxWidth="md" sx={{ textAlign: 'center' }}>
              <Divider sx={{ mb: 3 }} />
              <AttributionInfo type="activity" author={author} derivedFrom={activity.derivedFrom} />
            </Container>
          </Grid>
          <Grid
            lg={2}
            sx={{
              display: {
                xs: 'none', sm: 'none', md: 'none', lg: 'block',
              },
            }}
          >
            <TableOfContents initialized elementRef={cellsRef} selector="h2[id], h3[id]" title="In this activity" />
          </Grid>
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
