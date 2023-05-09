import Container from '@mui/material/Container';
import { MDXRemote } from 'next-mdx-remote';

import {
  Box, Button, Stack, Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CodeCell from '../../../../../../components/CodeCell';
import NavigationBar from '../../../../../../components/NavigationBar';
import { asSingleSource, createCodeCell, useLocalActivity } from '../../../../../../src/localStorage/useLocalActivity';
import { activityAssetPathname, activityPathname, activityVariantPathname } from '../../../../../../src/urlUtils';
import VariantSelector from '../../../../../../components/VariantsSelector';
import downloadSourceCode from '../../../../../../src/codeDownload';
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
import listAuthors from '../../../../../../src/fs-content/authors';
import { countLines } from '../../../../../../src/sourceUtils';

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

  const initialCodeCells = cells
    .map((cell, idx) => ({ cell, idx }))
    .filter(({ cell }) => cell.cell_type === 'code')
    .map(({ cell, idx: originalIdx }) => createCodeCell(cell.source, originalIdx));
  const originalIdxToCodeCellIdx = new Map<number, number>();
  initialCodeCells.forEach((cell, idx) => originalIdxToCodeCellIdx.set(cell.originalIndex, idx));

  const {
    codeCells, cellsModified, completed, networkError,
    toggleCompleted, setNetworkError, handleSourceChanged, handleExecute,
    handleToggleOutputArea, handleResetState,
  } = useLocalActivity(initialCodeCells, activityVariant);

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
          <ResetButton enabled={cellsModified} onReset={handleResetState} />
          <MarkCompletedButton completed={completed} toggleCompleted={toggleCompleted} />
        </NavigationBar>
        <NetworkErrorSnackbar visible={networkError} setVisible={setNetworkError} />
        <DataSharingPreferenceDialog />
        <Container maxWidth="md">
          <Typography variant="h3" marginTop={2}>{title}</Typography>
          {cells.map((cell: NotebookCell, idx) => {
            if (cell.cell_type === 'markdown') {
              const markdownCell = cell as MarkdownCell;
              const components = {
                img: (props: any) => imgComponent(props, markdownCell, authorSlug, activitySlug),
                ReactPlayer: ResponsiveReactPlayer,
                Stack,
                API: ({ children: name }: { children: string }) => (
                  PyTamaroAPIComponent(name, activityVariant)
                ),
              };
              return (
                <MDXRemote
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...markdownCell.mdxSource}
                  key={markdownCell.id}
                  components={components}
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
                onSourceChanged={(newSource) => handleSourceChanged(newSource, cellIdx)}
                onExecutionRequested={() => handleExecute(cellIdx)}
                onOutputAreaToggled={() => handleToggleOutputArea(cellIdx)}
                firstLineNumber={firstLineNumber}
              />
            );
          })}
        </Container>
        <Stack mt={12} mb={6} direction="row" justifyContent="center" spacing={4}>
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={() => downloadSourceCode(asSingleSource(codeCells))}
          >
            Download Python Code
          </Button>
          <Button
            variant="contained"
            startIcon={<InfoIcon />}
            component={Link}
            href={activityPathname(authorSlug, activitySlug)}
          >
            Activity Info
          </Button>
        </Stack>
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
  const authors = await listAuthors();
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
