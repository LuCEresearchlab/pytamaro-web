import { EvaluatedDefinition } from './context';
import { sort_dependencies } from './evaluation';
import { UnsoundType, Value } from './expression';

export function create_code_from_definition(
  definition: EvaluatedDefinition<unknown>,
) {
  switch (definition.kind) {
    case 'function_definition': {
      switch (definition.subkind) {
        case 'imported':
          return `from ${definition.import.module} import ${definition.import.name}`;
        case 'local':
          throw new Error('Not supported Yet');
      }
      break;
    }
    case 'constant_definition':
      switch (definition.subkind) {
        case 'imported':
          return `from ${definition.import.module} import ${definition.import.name}`;
        case 'local':
          return `${definition.import.name} = ${create_code_from_expression(definition.value)}`;
      }
  }
}

export function create_code_from_expression(expression: Value) {
  if (expression.type === UnsoundType.Bottom)
    throw new Error(
      "Can't convert bottom typed expression to python expression",
    );

  return expression.value.expression;
}

export function create_code(
  expression: Value,
  definitions: EvaluatedDefinition<unknown>[],
) {
  const sorted = sort_dependencies(
    definitions,
    (v) => v.import,
    (v) => v.dependencies,
    (v) => definitions.find((o) => o.import === v),
  );
  return sorted
    .map(create_code_from_definition)
    .concat(['', create_code_from_expression(expression)])
    .join('\n');
}
