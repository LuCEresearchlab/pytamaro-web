import { ServerConnection, ContentsManager, KernelManager } from '@jupyterlab/services';
import path from 'path';

export interface ContentItem {
  name: string,
  path: string
  type: string
}

export interface NotebookCell {
  id: string,
  cell_type: string,
  source: string,
  attachments?: any,
}

export interface ExecutionResponse {
  type: string,
  content: any
}

const serverSettings = ServerConnection.makeSettings({
  baseUrl: process.env.JUPYTER_URL,
  token: process.env.JUPYTER_TOKEN,
});
const kernelManager = new KernelManager({ serverSettings });
const contentsManager = new ContentsManager({ serverSettings });

export async function getNotebookContent(
  slug: string,
  language: string,
  target: string,
  version: string,
) {
  const response = await contentsManager.get(path.join(slug, `${slug}-${language}-${target}-${version}.ipynb`));
  const { cells } = response.content;
  return cells;
}

export async function newKernel() {
  const kernel = await kernelManager.startNew();
  return kernel.id;
}

export async function executeCode(kernelId: string, code: string) {
  const kernelModel = await kernelManager.findById(kernelId);
  let result: ExecutionResponse = { type: '', content: {} };
  if (kernelModel !== undefined) {
    const kernel = kernelManager.connectTo({ model: kernelModel });
    const future = kernel.requestExecute({ code });
    future.onIOPub = (msg) => {
      switch (msg.header.msg_type) {
        case 'display_data':
        case 'execute_result':
        case 'stream':
          // TODO should merge results instead of keeping only the last one
          result = { type: 'success', content: msg.content };
          break;
        case 'error':
          result = { type: 'error', content: msg.content };
          break;
        default:
          break;
      }
    };
    await future.done;
  }
  return result;
}
