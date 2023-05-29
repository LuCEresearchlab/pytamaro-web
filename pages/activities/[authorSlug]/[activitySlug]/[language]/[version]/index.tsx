import Container from '@mui/material/Container';
import { MDXRemote } from 'next-mdx-remote';

import {
  Alert,
  AlertTitle,
  Box, Stack, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import CodeCell from '../../../../../../components/CodeCell';
import NavigationBar from '../../../../../../components/NavigationBar';
import { asSingleSource, useLocalActivity } from '../../../../../../src/localStorage/useLocalActivity';
import { activityAssetPathname, activityVariantPathname } from '../../../../../../src/urlUtils';
import VariantSelector from '../../../../../../components/VariantsSelector';
import ResponsiveReactPlayer from '../../../../../../components/ResponsiveReactPlayer';
import PyTamaroAPI from '../../../../../../components/PyTamaroAPIDocs/PyTamaroAPI';
import NetworkErrorSnackbar from '../../../../../../components/NetworkErrorSnackbar';
import ResetButton from '../../../../../../components/ResetButton';
import MarkCompletedButton from '../../../../../../components/MarkCompletedButton';
import DataSharingPreferenceDialog from '../../../../../../components/DataSharingPreferenceDialog';
import {
  ActivityVariant, LanguageWithLatestVersion, MarkdownCell, NotebookCell,
} from '../../../../../../src/schemas/activitySchema';
import { findLanguages, findVersions, variantInfo } from '../../../../../../src/fs-content/activities';
import getNotebookContent from '../../../../../../src/notebook';
import { countLines } from '../../../../../../src/sourceUtils';
import ActivityInfoButton from '../../../../../../components/ActivityInfoButton';
import CodeDownloadButton from '../../../../../../components/CodeDownloadButton';
import TableOfContents from '../../../../../../components/TableOfContents';
import { listAuthorsWithContent } from '../../../../../../src/fs-content/authors';
import { CodeCellState } from '../../../../../../src/localStorage/schema';
import ActivityLink from '../../../../../../components/ActivityLink';
import BackToCurriculum from '../../../../../../components/BackToCurriculum';

const userType = 'student';

function imgSourceTransformer(
  src: string,
  cell: NotebookCell,
  authorSlug: string,
  activitySlug: string,
) {
  const attachmentPrefix = 'attachment:';
  if (src.startsWith(attachmentPrefix)) {
    const name = src.substring(attachmentPrefix.length);
    const attachment = cell.attachments[name];
    const mimeType = Object.keys(attachment)[0];
    const data = attachment[mimeType];
    return `data:${mimeType};base64,${data}`;
  }
  try {
    return new URL(src).href;
  } catch {
    return activityAssetPathname(authorSlug, activitySlug, src);
  }
}

function imgComponent(props: any, cell: NotebookCell, authorSlug: string, activitySlug: string) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      component="span"
    >
      <picture>
        <img
        // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          alt={props.alt}
          src={imgSourceTransformer(props.src, cell, authorSlug, activitySlug)}
        />
      </picture>
    </Box>
  );
}

function PyTamaroAPIComponent(
  name: string,
  activityVariant: ActivityVariant,
) {
  return (
    <PyTamaroAPI name={name} activityVariant={activityVariant} />
  );
}

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

function MarkdownCellComponent({ cell, activityVariant } :
{ cell: MarkdownCell, activityVariant: ActivityVariant }) {
  const adHocComponents = {
    img: (props: any) => (
      imgComponent(props, cell, activityVariant.authorSlug, activityVariant.activitySlug)
    ),
    ReactPlayer: ResponsiveReactPlayer,
    Stack,
    API: ({ children: name }: { children: string }) => (
      PyTamaroAPIComponent(name, activityVariant)
    ),
    Activity: ActivityLink,
  };
  return (
    <MDXRemote
    // eslint-disable-next-line react/jsx-props-no-spreading
      {...cell.mdxSource}
      key={cell.id}
      components={adHocComponents}
    />
  );
}

export default function NotebookPage({
  title, cells, versions, languages,
}:
{ title : string, cells: NotebookCell[], versions: string[],
  languages: LanguageWithLatestVersion[] }) {
  const router = useRouter();
  const {
    authorSlug, activitySlug, language, version,
  } = router.query as {
    authorSlug: string,
    activitySlug: string,
    language: string,
    version: string,
  };
  const activityVariant = {
    authorSlug, activitySlug, language, version,
  };

  const initialCodeCells : CodeCellState[] = cells
    .map((cell, idx) => ({ cell, idx }))
    .filter(({ cell }) => cell.cell_type === 'code')
    .map(({ cell, idx: originalIdx }) => ({ source: cell.source, originalIndex: originalIdx }));
  const originalIdxToCodeCellIdx = new Map<number, number>();
  initialCodeCells.forEach((cell, idx) => originalIdxToCodeCellIdx.set(cell.originalIndex, idx));

  const {
    codeCells, codeExecutionStates, cellsModified,
    completed, networkError, localCodeCellsWrongLength,
    toggleCompleted, setNetworkError, handleSourceChanged, handleExecute,
    handleToggleOutputArea, handleResetActivity, handleResetSingleCell,
  } = useLocalActivity(initialCodeCells, activityVariant);

  const cellsRef = useRef<HTMLDivElement>(null);

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
            authorSlug={authorSlug}
            activitySlug={activitySlug}
            language={language}
            version={version}
            versions={versions}
            languages={languages}
          />
          <ResetButton enabled={cellsModified} onReset={handleResetActivity} />
          <ActivityInfoButton authorSlug={authorSlug} activitySlug={activitySlug} />
        </NavigationBar>
        <NetworkErrorSnackbar visible={networkError} setVisible={setNetworkError} />
        <DataSharingPreferenceDialog />
        <Grid container>
          <Grid lg={10} xl={11}>
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
                      onOutputAreaToggled={() => handleToggleOutputArea(cellIdx)}
                      onReset={() => handleResetSingleCell(cellIdx)}
                      firstLineNumber={firstLineNumber}
                      activityVariant={activityVariant}
                    />
                  );
                })}
            </Container>
            <Stack mt={12} mb={6} direction="row" justifyContent="center" spacing={4}>
              <CodeDownloadButton getSource={() => asSingleSource(codeCells)} />
              <MarkCompletedButton completed={completed} toggleCompleted={toggleCompleted} />
            </Stack>
            <BackToCurriculum />
          </Grid>
          <Grid
            lg={2}
            xl={1}
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
      title: (await variantInfo(authorSlug, activitySlug, language)).title,
      cells: await getNotebookContent(authorSlug, activitySlug, language, version, userType),
      versions: await findVersions(authorSlug, activitySlug, language),
      languages: await findLanguages(authorSlug, activitySlug),
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
            .map((v) => activityVariantPathname(author.slug, activity.slug, notebook.language, v)),
        )));
  return {
    paths: (await Promise.all(paths)).flat(),
    fallback: false,
  };
}
