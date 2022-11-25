import ReactMarkdown, { uriTransformer } from 'react-markdown';
import axios from 'axios';
import Container from '@mui/material/Container';

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import {
  getNotebookContent, NotebookCell,
} from '../../../../../../src/NotebooksManager';
import CodeCell from '../../../../../../components/CodeCell';
import {
  listModules, NotebookVariant, variantInfo,
} from '../../../../../../src/Modules';
import NavigationBar from '../../../../../../components/NavigationBar';

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

async function requestNewKernel() {
  return axios.post('/api/newKernel').then((response) => response.data.kernelId);
}

const NO_KERNEL = '';

export default function NotebookPage({ title, cells }: { title : string, cells: NotebookCell[] }) {
  const [kernelId, setKernelId] = useState(NO_KERNEL);
  useEffect(() => {
    const updateKernelId = async () => {
      setKernelId(await requestNewKernel());
    };
    // Wait 1 second before requesting a new kernel to avoid
    // spawning a new one when the user (or a bot) is just
    // visiting the page.
    if (kernelId === NO_KERNEL) {
      setTimeout(updateKernelId, 1000);
    }
  }, [kernelId]);
  return (
    <Box>
      <NavigationBar title={title} />
      <Container>
        {cells.map((cell: NotebookCell) => {
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
          return <CodeCell key={cell.id} source={cell.source} kernelId={kernelId} />;
        })}
      </Container>

    </Box>
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
