import { TFunction } from 'i18next';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';
import {
  TideError,
  TideNameError,
  TideNameErrorCyclicalDependencies,
  TideSyntaxError,
} from '../../src/tide/language/errors';

function getRawContent(
  annotation: TideError,
  t: TFunction,
): {
  title: string;
  message: string;
} {
  switch (annotation.kind) {
    case 'syntax-error': {
      const title = t('errors.syntaxError');
      switch ((annotation as TideSyntaxError).subkind) {
        case 'invalid_constant_identifier':
          return {
            title,
            message: t('errors.invalidConstantIdentifier', {
              name: annotation.args[0].value,
            }),
          };
        case 'invalid_function_identifier':
          return {
            title,
            message: t('errors.invalidFunctionIdentifier', {
              name: annotation.args[0].value,
            }),
          };
        case 'constant_has_no_value':
          return {
            title,
            message: t('errors.constantHasNoValue', {
              name: annotation.args[0].value,
            }),
          };
        case 'invalid_literal':
          return {
            title,
            message: t('errors.invalidLiteral', {
              value: annotation.args[0].value,
            }),
          };
        case 'missing_parameter':
          return {
            title,
            message: t('errors.missingParameter', {
              name: annotation.args[0].value,
            }),
          };
        default:
          return { title, message: t('errors.syntaxErrorGeneric') };
      }
    }
    case 'type-error': {
      const title = t('errors.typeError');
      return {
        title,
        message: t('errors.typeMismatch', {
          expected: annotation.args[0].value,
          got: annotation.args[1].value,
        }),
      };
    }
    case 'name-error': {
      const title = t('errors.nameError');
      switch ((annotation as TideNameError).subkind) {
        case 'unknown_constant':
          return {
            title,
            message: t('errors.unknownConstant', {
              name: annotation.args[0].value,
            }),
          };
        case 'multiple_definitions':
          return {
            title,
            message: t('errors.multipleDefinitions', {
              name: annotation.args[0].value,
            }),
          };
        case 'node_kind_mismatch':
          return { title, message: t('errors.nodeKindMismatch') };
        case 'cyclical_dependencies': {
          const names = (annotation as TideNameErrorCyclicalDependencies)
            .args[0].value;
          const dependencies = names
            .map((v, i) => [
              v,
              i !== names.length - 1 ? names[i + 1] : names[0],
            ])
            .toReversed()
            .map(([dependency, constant]) =>
              t('errors.dependsOn', { constant, dependency }),
            )
            .join(t('errors.dependsOnSeparator'));

          return {
            title,
            message: t('errors.cyclicalDependencies', { names: dependencies }),
          };
        }
        case 'unknown_function':
          return {
            title,
            message: t('errors.unknownFunction', {
              name: annotation.args[0].value,
            }),
          };
        default:
          return { title, message: t('errors.nameErrorGeneric') };
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
      return { title: t('errors.error'), message: t('errors.unknownError') };
  }
}

export function ErrorParagraph(props: { annotation: TideError }) {
  const { t } = useLocalTranslation(['tide']);
  const { annotation } = props;

  const { title, message } = getRawContent(annotation, t);

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
