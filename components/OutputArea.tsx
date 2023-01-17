import { ExecutionResponse } from '../src/CodeExecution';

export default function OutputArea(
  { executionResponse }: { executionResponse: ExecutionResponse },
) {
  if (executionResponse.type === 'success') {
    const { content } = executionResponse;
    if (content.startsWith('data:image/png;base64,')) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={content} alt="Execution result" />;
    }
    return <pre>{content}</pre>;
  } if (executionResponse.type === 'error') {
    const traceback = executionResponse.content;
    return <pre style={{ color: 'red' }}>{traceback}</pre>;
  }
  return <div />;
}
