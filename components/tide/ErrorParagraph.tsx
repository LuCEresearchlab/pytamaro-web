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
        case 'missing_parameter':
          return { title, message: 'Missing argument for parameter *{name}*.' };
        case 'constant_has_no_value':
          return { title, message: 'Constant *{name}* has no value.' };
        case 'invalid_literal':
          return { title, message: 'Literal value *{value}* is invalid.' };
        case 'node_kind_mismatch':
          return { title, message: 'Node kind mismatch.' };
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
    default:
      return { title: 'Error', message: 'Unknown error.' };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className='error-paragraph'>
      <p className='error-title'>{title}</p>
      <div className='error-body'>
        {message.split('\n').map((line, i) => (
          <div key={i}>
            {line.split('*').map((v, i) =>
              i % 2 === 0 ? (
                <span key={i}>{v}</span>
              ) : (
                <span className='error_highlight' key={i}>
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
