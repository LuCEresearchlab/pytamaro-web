import theme from '../../src/theme';
import {
  TideError,
  TideNameError,
  TideSyntaxError,
} from '../../src/tide/language/errors';

function getRawContent(annotation: TideError): {
  title: string;
  message: string;
} {
  switch (annotation.kind) {
    case 'syntax-error': {
      const title = 'Syntax Error';
      switch ((annotation as TideSyntaxError).subkind) {
        case 'invalid_constant_identifier':
          return { title, message: 'Constant identifier *{name}* is invalid.' };
        case 'invalid_function_identifier':
          return { title, message: 'Function identifier *{name}* is invalid.' };
        case 'constant_has_no_value':
          return { title, message: 'Constant *{name}* has no value.' };
        case 'invalid_literal':
          return { title, message: 'Literal value *{value}* is invalid.' };
        default:
          return { title, message: 'Syntax error.' };
      }
    }
    case 'type-error': {
      const title = 'Type Error';
      return { title, message: 'Expected *{expected}*, got *{got}*.' };
    }
    case 'name-error': {
      const title = 'Name Error';
      switch ((annotation as TideNameError).subkind) {
        case 'unknown_constant':
          return { title, message: 'The constant *{name}* is not defined.' };
        case 'multiple_definitions':
          return {
            title,
            message: 'The constant *{name}* is defined multiple times.',
          };
        case 'missing_parameter':
          return { title, message: 'Missing argument for parameter *{name}*.' };
        case 'node_kind_mismatch':
          return { title, message: 'Node kind mismatch.' };
        case 'cyclical_dependencies':
          return {
            title,
            message:
              'Cyclic dependencies between constant definitions: \n{names}.',
          };
        case 'unknown_function':
          return { title, message: 'The function *{name}* is not defined.' };
        default:
          return { title, message: 'Name error.' };
      }
    }
    case 'runtime-error': {
      const [title, message] = annotation.args[0].value
        .replaceAll('`', '*')
        .split(':', 2);
      return { title, message };
    }
    default:
      // eslint-disable-next-line no-console
      console.error(JSON.stringify(annotation));
      return { title: 'Error', message: 'Unknown error.' };
  }
}

export function ErrorParagraph(props: { annotation: TideError }) {
  const { annotation } = props;

  const { title, message: raw_message } = getRawContent(annotation);

  const message = annotation.args.reduce((a, b) => {
    if (b.name === 'names')
      return a.replaceAll(
        `{${b.name}}`,
        b.value
          .map((v, i) => [
            v,
            i != b.value.length - 1 ? b.value[i + 1] : b.value[0],
          ])
          .toReversed()
          .map((v) => `the meaning of *${v[1]}* depends on *${v[0]}*`)
          .join(', and \n'),
      );
    return a.replaceAll(`{${b.name}}`, String(b.value));
  }, raw_message);

  return (
    <div>
      <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>
        {title}
      </p>
      <div style={{ fontSize: '1.25em' }}>
        {message.split('\n').map((line, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}>
            {line.split('*').map((v, i) =>
              i % 2 === 0 ? (
                // eslint-disable-next-line react/no-array-index-key
                <span key={i}>{v}</span>
              ) : (
                <span
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  style={{
                    fontFamily: theme.pytamaro.monospaceFontFamily,
                    color: theme.pytamaro.palette.red,
                  }}
                >
                  {v}
                </span>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
