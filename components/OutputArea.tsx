import { ExecutionResponse } from '../src/CodeExecution';

export default function OutputArea(
  { executionResponse }: { executionResponse: ExecutionResponse },
) {
  let child = null;
  if (executionResponse.type === 'success') {
    const { content } = executionResponse;
    if (content.startsWith('data:image/png;base64,')) {
      // eslint-disable-next-line @next/next/no-img-element
      child = <img src={content} alt="Execution result" />;
    } else {
      child = <pre>{content}</pre>;
    }
  } if (executionResponse.type === 'error') {
    const traceback = executionResponse.content;
    child = <pre style={{ color: 'red' }}>{traceback}</pre>;
  }
  return <div style={{ width: 'max-content' }}>{child}</div>;
}
