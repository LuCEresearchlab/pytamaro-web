import ReactMarkdown, { uriTransformer } from 'react-markdown';
import Container from '@mui/material/Container';

import { Box } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  getNotebookContent, NotebookCell,
} from '../../../../../src/Notebook';
import CodeCell from '../../../../../components/CodeCell';
import {
  findLanguages,
  findVersions,
  LanguageWithLatestVersion,
  listModules,
  variantInfo,
} from '../../../../../src/Modules';
import NavigationBar from '../../../../../components/NavigationBar';
import DownloadCodeButton from '../../../../../components/CodeDownloadButton';
import { createCodeCell, useCodeState } from '../../../../../src/codeState';
import ResetButton from '../../../../../components/ResetButton';
import { notebookVersionUrl } from '../../../../../src/urlUtils';
import VariantSelector from '../../../../../components/VariantsSelector';

function attachmentsTransformer(src: string, cell: NotebookCell) {
  const attachmentPrefix = 'attachment:';
  if (src.startsWith(attachmentPrefix)) {
    const name = src.substring(attachmentPrefix.length);
    const attachment = cell.attachments[name];
    const mimeType = Object.keys(attachment)[0];
    const data = attachment[mimeType];
    return `data:${mimeType};base64,${data}`;
  }
  return uriTransformer(src);
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
  const moduleVariantId = `${slug}-${language}`;
  const moduleVersionId = `${moduleVariantId}-${version}`;

  const initialCodeCells = cells
    .filter((cell) => cell.cell_type === 'code')
    .map((cell) => createCodeCell(cell.source, parseInt(cell.id, 10)));
  const originalIdxToCodeCellIdx = new Map<number, number>();
  initialCodeCells.forEach((cell, idx) => originalIdxToCodeCellIdx.set(cell.originalIndex, idx));

  const {
    codeCells, cellsModified, handleSourceChanged, handleExecute,
    handleToggleOutputArea, handleResetState, getWholeSource,
  } = useCodeState(initialCodeCells, moduleVersionId);

  const pageTitle = `${title} - PyTamaro`;

  const userType = 'student';
  const TEACHER_ONLY_CELL_PREFIX = '#teacher-only';

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar title={title} />
        <ResetButton visible={cellsModified} onReset={handleResetState} />
        <VariantSelector
          slug={slug}
          language={language}
          version={version}
          versions={versions}
          languages={languages}
        />
        <Container>
          {cells.map((cell: NotebookCell, idx) => {
            if (userType === 'student' && cell.source.trimStart().startsWith(TEACHER_ONLY_CELL_PREFIX)) {
              return (<Box key={cell.id} />);
            }
            if (cell.cell_type === 'markdown') {
              return (
                <ReactMarkdown
                  key={cell.id}
                  transformImageUri={(src) => attachmentsTransformer(src, cell)}
                >
                  {cell.source}
                </ReactMarkdown>
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
          <DownloadCodeButton getSource={getWholeSource} />
        </Container>
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
  const modules = await listModules();
  const paths = modules.flatMap((module) => module.variants.flatMap(
    async (notebook) => (await findVersions(module.slug, notebook.language))
      .map((v) => `/modules/${notebookVersionUrl(module.slug, notebook.language, v)}`),
  ));
  return {
    paths: (await Promise.all(paths)).flat(),
    fallback: false,
  };
}
