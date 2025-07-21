import { EvaluatedDefinition } from './definitions';
import { sort_dependencies } from './evaluation';
import { Value } from './expression';
import { Location } from './types';
import { UnsoundType } from './typing';

export function create_code_from_definition(
  definition: EvaluatedDefinition<unknown>,
) {
  switch (definition.kind) {
    case 'function_definition': {
      switch (definition.subkind) {
        case 'imported':
          return `from ${definition.location.module} import ${definition.location.name}`;
        case 'local':
          throw new Error('Not supported Yet');
      }
      break;
    }
    case 'constant_definition':
      switch (definition.subkind) {
        case 'imported':
          return `from ${definition.location.module} import ${definition.location.name}`;
        case 'local':
          return `${definition.location.name} = ${create_code_from_expression(definition.value)}`;
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
  expression: Value | string,
  definitions: EvaluatedDefinition<unknown>[],
) {
  const sorted = sort_dependencies(
    definitions,
    (v) => v.location,
    (v) => ('dependencies' in v ? v.dependencies : []),
    (v) => definitions.find((o) => o.location === v),
  ).reverse();
  return sorted
    .map(create_code_from_definition)
    .concat([
      '',
      typeof expression === 'string'
        ? expression
        : create_code_from_expression(expression),
    ])
    .join('\n');
}
export interface CodeRepresentation {
  expression: string;
  imports: Location[];
}
