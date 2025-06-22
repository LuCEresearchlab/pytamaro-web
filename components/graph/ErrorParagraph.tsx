import { ErrorAnnotation } from './annotations';

export function ErrorParagraph(props: { annotation: ErrorAnnotation }) {
  const { annotation } = props;

  const title = {
    'syntax-error': 'Syntax Error',
    'type-error': 'Type Error',
    'value-error': 'Value Error',
  }[annotation.kind];

  const message = annotation.args.reduce(
    (a, b) => a.replaceAll(`{${b.name}}`, b.value),
    {
      'syntax-error': 'Missing argument for parameter *{name}*.',
      'type-error': 'Expected *{expected}*, got *{got}*.',
      'value-error': 'Invalid value for parameter *{name}*.',
    }[annotation.kind],
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
