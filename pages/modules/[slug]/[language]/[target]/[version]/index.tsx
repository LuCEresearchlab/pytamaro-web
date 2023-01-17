import ReactMarkdown, { uriTransformer } from 'react-markdown';
import Container from '@mui/material/Container';

import { useState } from 'react';
import { Box } from '@mui/material';
import Head from 'next/head';
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

function replaceAt<T>(array: T[], index: number, value: T) {
  const ret = array.slice(0);
  ret[index] = value;
  return ret;
}

export default function NotebookPage({ title, cells }: { title : string, cells: NotebookCell[] }) {
  const originalCodeFragments = cells.map((cell) => (cell.cell_type === 'code' ? cell.source : ''));
  const [codeFragments, setCodeFragments] = useState<string[]>(originalCodeFragments);

  const getWholeSource = () => codeFragments.filter((f) => f.length > 0).join('\n');

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
                onSourceChanged={
                (newSource: string) => setCodeFragments(replaceAt(codeFragments, idx, newSource))
              }
                compile={() => executeCode(codeFragments.slice(0, idx + 1).join('\n'))}
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
