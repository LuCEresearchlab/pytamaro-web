import AnsiUp from 'ansi_up';
import { ExecutionResponse } from '../src/codeExecution';

function dataURIPrefix(mime: string) {
  return `data:${mime};base64,`;
}

export default function OutputArea(
  { executionResponse }: { executionResponse: ExecutionResponse },
) {
  let child = null;
  if (executionResponse.type === 'success') {
    const { content } = executionResponse;
    if (content.startsWith(dataURIPrefix('image/png')) || content.startsWith(dataURIPrefix('image/gif'))) {
    // eslint-disable-next-line @next/next/no-img-element
      child = <img src={content} alt="Execution result" />;
    } else {
      child = <pre>{content}</pre>;
    }
  } if (executionResponse.type === 'error') {
    const traceback = executionResponse.content;
    const html = new AnsiUp().ansi_to_html(traceback);
    // eslint-disable-next-line react/no-danger
    child = <pre dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <div style={{ width: 'max-content' }}>{child}</div>;
}
