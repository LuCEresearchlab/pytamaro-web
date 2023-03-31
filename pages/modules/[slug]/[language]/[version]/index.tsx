import Container from '@mui/material/Container';
import { MDXRemote } from 'next-mdx-remote';

import { Box, Button, Stack } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  getNotebookContent, NotebookCell,
} from '../../../../../src/Notebook';
import CodeCell from '../../../../../components/CodeCell';
import {
  findLanguages,
  findVersions,
  LanguageWithLatestVersion,
  listActivities,
  variantInfo,
} from '../../../../../src/Activities';
import NavigationBar from '../../../../../components/NavigationBar';
import { createCodeCell, useCodeState } from '../../../../../src/codeState';
import ResetButton from '../../../../../components/ResetButton';
import { notebookVersionUrl } from '../../../../../src/urlUtils';
import VariantSelector from '../../../../../components/VariantsSelector';
import downloadSourceCode from '../../../../../src/CodeDownload';
import ResponsiveReactPlayer from '../../../../../components/ResponsiveReactPlayer';
import PyTamaroAPI from '../../../../../components/PyTamaroAPIDocs/PyTamaroAPI';

function attachmentsTransformer(src: string, cell: NotebookCell) {
  const attachmentPrefix = 'attachment:';
  if (src.startsWith(attachmentPrefix)) {
    const name = src.substring(attachmentPrefix.length);
    const attachment = cell.attachments[name];
    const mimeType = Object.keys(attachment)[0];
    const data = attachment[mimeType];
    return `data:${mimeType};base64,${data}`;
  }
  return src;
}

function attachmentsImage(props: any, cell: NotebookCell) {
  return (
    <picture>
      <img
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        alt={props.alt}
        src={attachmentsTransformer(props.src, cell)}
      />
    </picture>
  );
}

function PyTamaroAPIWithLanguage(name: string, lang: string) {
  return (
    <PyTamaroAPI name={name} lang={lang} />
  );
}

export default function NotebookPage({
  title, cells, versions, languages,
}:
{ title : string, cells: NotebookCell[], versions: string[],
  languages: LanguageWithLatestVersion[] }) {
  const router = useRouter();
  const {
    slug, language, version,
  } = router.query as { slug: string, language: string, version: string };
  const activityVariantId = `${slug}-${language}`;
  const activityVersionId = `${activityVariantId}-${version}`;

  const initialCodeCells = cells
    .filter((cell) => cell.cell_type === 'code')
    .map((cell) => createCodeCell(cell.source, parseInt(cell.id, 10)));
  const originalIdxToCodeCellIdx = new Map<number, number>();
  initialCodeCells.forEach((cell, idx) => originalIdxToCodeCellIdx.set(cell.originalIndex, idx));

  const {
    codeCells, cellsModified, handleSourceChanged, handleExecute,
    handleToggleOutputArea, handleResetState, getWholeSource,
  } = useCodeState(initialCodeCells, activityVersionId);

  const pageTitle = `${title} - PyTamaro`;

  const userType = 'student';
  const TEACHER_ONLY_CELL_PREFIX = '#teacher-only';

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar>
          <VariantSelector
            slug={slug}
            language={language}
            version={version}
            versions={versions}
            languages={languages}
          />
        </NavigationBar>
        <ResetButton visible={cellsModified} onReset={handleResetState} />
        <Container>
          <h1>{title}</h1>
          {cells.map((cell: NotebookCell, idx) => {
            if (userType === 'student' && cell.source.trimStart().startsWith(TEACHER_ONLY_CELL_PREFIX)) {
              return (<Box key={cell.id} />);
            }
            if (cell.cell_type === 'markdown') {
              const components = {
                img: (props: any) => attachmentsImage(props, cell),
                ReactPlayer: ResponsiveReactPlayer,
                Stack,
                API: ({ children: name }: { children: string }) => (
                  PyTamaroAPIWithLanguage(name, language)
                ),
              };
              return (
                <MDXRemote
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...cell.mdxSource}
                  key={cell.id}
                  components={components}
                />
              );
            }
            const cellIdx = originalIdxToCodeCellIdx.get(idx) as number;
            const currentCodeCell = codeCells[cellIdx];
            return (
              <CodeCell
                key={cell.id}
                codeCellState={currentCodeCell}
                onSourceChanged={(newSource) => handleSourceChanged(newSource, cellIdx)}
                onExecutionRequested={() => handleExecute(cellIdx)}
                onOutputAreaToggled={() => handleToggleOutputArea(cellIdx)}
              />
            );
          })}
        </Container>
        <Stack mt={6} mb={6} direction="row" justifyContent="center" spacing={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={() => downloadSourceCode(getWholeSource())}
          >
            Download Python Code
          </Button>
          <Button
            variant="outlined"
            startIcon={<InfoIcon />}
            component={Link}
            href={`/activities/${slug}`}
          >
            Activity Information
          </Button>
        </Stack>
      </Box>
    </div>
  );
}

export async function getStaticProps(
  context: { params: { slug: string, language: string, version: string } },
) {
  const {
    slug, language, version,
  } = context.params;
  return {
    props: {
      title: (await variantInfo(slug, language)).title,
      cells: await getNotebookContent(slug, language, version),
      versions: await findVersions(slug, language),
      languages: await findLanguages(slug),
    },
  };
}

export async function getStaticPaths() {
  const activities = await listActivities();
  const paths = activities.flatMap((activity) => activity.variants.flatMap(
    async (notebook) => (await findVersions(activity.slug, notebook.language))
      .map((v) => `/activities/${notebookVersionUrl(activity.slug, notebook.language, v)}`),
  ));
  return {
    paths: (await Promise.all(paths)).flat(),
    fallback: false,
  };
}
