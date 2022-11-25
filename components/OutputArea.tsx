import AnsiToHTMLConverter from 'ansi-to-html';
import { ExecutionResponse } from '../src/NotebooksManager';

export default function OutputArea(
  { executionResponse }: { executionResponse: ExecutionResponse },
) {
  if (executionResponse.type === 'success') {
    const mimeTypesToValues = executionResponse.content.data;
    if (mimeTypesToValues === undefined) {
      return <pre>{executionResponse.content.text}</pre>;
    } if ('image/png' in mimeTypesToValues) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={`data:image/png;base64,${mimeTypesToValues['image/png']}`} alt="Execution result" />;
    }
    return <pre>{mimeTypesToValues['text/plain']}</pre>;
  } if (executionResponse.type === 'error') {
    const traceback = executionResponse.content.traceback.join('\n');
    const tracebackHtml = new AnsiToHTMLConverter().toHtml(traceback);
    // The HTML comes from the jupyter server,
    // which either serves output from content we generated or
    // from the user's own commands.
    // It would be better to sanitize it anyways.

    // eslint-disable-next-line react/no-danger
    return <pre dangerouslySetInnerHTML={{ __html: tracebackHtml }} />;
  }
  return <div />;
}
