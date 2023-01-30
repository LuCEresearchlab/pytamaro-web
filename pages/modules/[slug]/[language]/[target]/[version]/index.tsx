import ReactMarkdown, { uriTransformer } from 'react-markdown';
import Container from '@mui/material/Container';

import { useState } from 'react';
import { Box } from '@mui/material';
import Head from 'next/head';
import produce from 'immer';
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
import { executeCode } from '../../../../../../src/CodeExecution';
import DownloadCodeButton from '../../../../../../components/CodeDownloadButton';

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
  const originalCodeFragments = cells.map((cell) => (cell.cell_type === 'code' ? cell.source : ''));
  const [codeFragments, setCodeFragments] = useState<string[]>(originalCodeFragments);

  const getSourceFirstNCodeCells = (n: number) => codeFragments.slice(0, n).filter((f) => f.length > 0).join('\n');

  const getWholeSource = () => getSourceFirstNCodeCells(codeFragments.length);

  const handleSourceChanged = (newSource: string, idx: number) => setCodeFragments(
    produce(codeFragments, (draft) => {
      draft[idx] = newSource;
    }),
  );

  const indentSource = (source: string) => source.split('\n').map((line) => `\t${line}`).join('\n');

  const codeFirstNCells = (n: number) => {
    // Creates a Python source with all the previous cells embedded within a
    // context manager that redirects stdout and stderr to None, so that the
    // only the stdout/stderr of the current cell is considered.
    const currentCellSource = codeFragments[n];
    const previousCellsSource = getSourceFirstNCodeCells(n);
    return `
from contextlib import redirect_stdout, redirect_stderr
with redirect_stdout(None), redirect_stderr(None):
${previousCellsSource ? indentSource(previousCellsSource) : '\tpass'}

${currentCellSource}`;
  };

  const pageTitle = `${title} - PyTamaro`;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Box>
        <NavigationBar title={title} />
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
            return (
              <CodeCell
                key={cell.id}
                source={codeFragments[idx]}
                onSourceChanged={(newSource) => handleSourceChanged(newSource, idx)}
                compile={() => executeCode(codeFirstNCells(idx))}
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
