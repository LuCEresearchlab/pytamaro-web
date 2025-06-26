import { ErrorAnnotation } from './annotations';

export function ErrorParagraph(props: { annotation: ErrorAnnotation }) {
  const { annotation } = props;

  const title = {
    'syntax-error': 'Syntax Error',
    'type-error': 'Type Error',
    'value-error': 'Value Error',
    'name-error': 'Name Error',
  }[annotation.kind];

  const message = annotation.args.reduce(
    (a, b) => a.replaceAll(`{${b.name}}`, b.value),
    ((): string => {
      let group = {
        'syntax-error': {
          invalid_constant_identifier:
            'Constant identifier *{name}* is invalid.',
          missing_parameter: 'Missing argument for parameter *{name}*.',
          constant_has_no_value: 'Constant *{name}* has no value.',
        },
        'type-error': 'Expected *{expected}*, got *{got}*.',
        'value-error': 'Invalid value for parameter *{name}*.',
        'name-error': {
          unknown_constant: 'The constant *{name}* is not defined',
          multiple_definitions:
            'The constant *{name}* is defined multiple times',
          cyclical_dependencies:
            'The constants {names} are in a cyclical dependence',
        },
      }[annotation.kind];

      if (Object.keys(annotation).includes('subkind')) {
        group = (group as any)[(annotation as any).subkind] as string;
      }

      return group as string;
    })(),
  );

  return (
    <div className='error-paragraph'>
      <p className='error-title'>{title}</p>
      <p className='error-body'>
        {message.split('*').map((v, i) =>
          i % 2 === 0 ? (
            <span key={i}>{v}</span>
          ) : (
            <span className='error_highlight' key={i}>
              {v}
            </span>
          ),
        )}
      </p>
    </div>
  );
}
