import ReactMarkdown, { uriTransformer } from 'react-markdown';
import Container from '@mui/material/Container';

import { Box, Button, Grid } from '@mui/material';
import Head from 'next/head';
import { RestartAlt } from '@mui/icons-material';
import {
  getNotebookContent, NotebookCell,
} from '../../../../../../src/NotebooksManager';
import CodeCell from '../../../../../../components/CodeCell';
import {
  listModules,
  NotebookVariant,
  variantInfo,
} from '../../../../../../src/Modules';
import NavigationBar from '../../../../../../components/NavigationBar';
import DownloadCodeButton from '../../../../../../components/CodeDownloadButton';
import { createCodeCell, useCodeState } from '../../../../../../src/codeState';

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

export default function NotebookPage({ title, cells }: { title : string, cells: NotebookCell[] }) {
  const initialCodeCells = cells
    .filter((cell) => cell.cell_type === 'code')
    .map((cell) => createCodeCell(cell.source, parseInt(cell.id, 10)));
  const originalIdxToCodeCellIdx = new Map<number, number>();
  initialCodeCells.forEach((cell, idx) => originalIdxToCodeCellIdx.set(cell.originalIndex, idx));

  const {
    codeCells, handleSourceChanged, handleExecute,
    handleToggleOutputArea, handleResetState, getWholeSource,
  } = useCodeState(initialCodeCells);

  const pageTitle = `${title} - PyTamaro`;

  const initialContentModified = JSON.stringify(initialCodeCells) !== JSON.stringify(codeCells);

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar title={title} />
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            color="error"
            endIcon={<RestartAlt />}
            sx={{ m: 2, mb: -6, visibility: initialContentModified ? 'visible' : 'hidden' }}
            onClick={handleResetState}
          >
            Reset
          </Button>
        </Grid>
        <Container>
          {cells.map((cell: NotebookCell, idx) => {
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
  context: { params: { slug: string, language: string, target: string, version: string } },
) {
  const {
    slug, language, target, version,
  } = context.params;
  return {
    props: {
      title: (await variantInfo(slug, language, target)).title,
      cells: await getNotebookContent(slug, language, target, version),
    },
  };
}

export async function getStaticPaths() {
  const modules = await listModules();
  const allVariantPaths = modules.flatMap((module) => module.variants.map((notebook: NotebookVariant) => `/modules/${module.slug}/${notebook.language}/${notebook.target}/latest`));
  return {
    paths: allVariantPaths,
    fallback: false,
  };
}
