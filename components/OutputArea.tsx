import AnsiUp from 'ansi_up';
import { isEmpty, negate } from 'lodash';
import { ExecutionResponse } from '../src/codeExecution';
import theme from '../src/theme';

function dataURIPrefix(mime: string) {
  return `data:${mime};base64,`;
}

const OUTPUT_ELEMENT_STYLE = {
  display: 'block',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
};

function imgElement(dataURI: string) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataURI} style={OUTPUT_ELEMENT_STYLE} alt="Graphical output from execution result" />;
}

function preElement(htmlContent: string) {
  // eslint-disable-next-line react/no-danger
  return <pre style={OUTPUT_ELEMENT_STYLE} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

export default function OutputArea(
  { executionResponse }: { executionResponse: ExecutionResponse },
) {
  const pytamaroDataUriRegex = /@@@PYTAMARO_DATA_URI_BEGIN@@@(.*?)@@@PYTAMARO_DATA_URI_END@@@/g;
  const htmlContent = new AnsiUp().ansi_to_html(executionResponse.content);
  return (
    <div style={{ width: 'max-content' }}>
      {htmlContent.split(pytamaroDataUriRegex).filter(negate(isEmpty)).map((chunk: string) => (
        chunk.startsWith(dataURIPrefix('image/png')) || chunk.startsWith(dataURIPrefix('image/gif'))
          ? imgElement(chunk)
          : preElement(chunk)
      ))}
    </div>
  );
}
