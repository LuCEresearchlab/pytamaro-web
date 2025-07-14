import {
  TideGenericError,
  TideNameErrorCyclicalDependencies,
  TideNameErrorMultipleDefinition,
  TideNameErrorUnknownConstant,
  TideNameErrorUnknownFunction,
  TideSyntaxErrorConstantHasNoValue,
  TideSyntaxErrorInvalidConstantIdentifier,
  TideSyntaxErrorInvalidFunctionIdentifier,
  TideSyntaxErrorInvalidLiteral,
  TideSyntaxErrorMissingParameter,
  TideSyntaxErrorNodeKindMismatch,
  TideTypeError,
  TideValueError,
} from './errors';

export function TideSyntaxErrorNodeKindMismatch_builder(
  expected_kind: string,
  got_kind: string,
): TideSyntaxErrorNodeKindMismatch {
  return {
    kind: 'syntax-error',
    subkind: 'node_kind_mismatch',
    args: [
      { name: 'expected_kind', value: expected_kind },
      { name: 'got_kind', value: got_kind },
    ],
  };
}

export function TideSyntaxErrorInvalidConstantIdentifier_builder(
  name: string,
): TideSyntaxErrorInvalidConstantIdentifier {
  return {
    kind: 'syntax-error',
    subkind: 'invalid_constant_identifier',
    args: [{ name: 'name', value: name }],
  };
}

export function TideSyntaxErrorInvalidFunctionIdentifier_builder(
  name: string,
): TideSyntaxErrorInvalidFunctionIdentifier {
  return {
    kind: 'syntax-error',
    subkind: 'invalid_function_identifier',
    args: [{ name: 'name', value: name }],
  };
}

export function TideSyntaxErrorInvalidLiteral_builder(
  value: string,
): TideSyntaxErrorInvalidLiteral {
  return {
    kind: 'syntax-error',
    subkind: 'invalid_literal',
    args: [{ name: 'value', value: value }],
  };
}

export function TideSyntaxErrorConstantHasNoValue_builder(
  name: string,
): TideSyntaxErrorConstantHasNoValue {
  return {
    kind: 'syntax-error',
    subkind: 'constant_has_no_value',
    args: [{ name: 'name', value: name }],
  };
}

export function TideSyntaxErrorMissingParameter_builder(
  name: string,
): TideSyntaxErrorMissingParameter {
  return {
    kind: 'syntax-error',
    subkind: 'missing_parameter',
    args: [{ name: 'name', value: name }],
  };
}

export function TideTypeError_builder(
  expected: string,
  got: string,
): TideTypeError {
  return {
    kind: 'type-error',
    args: [
      { name: 'expected', value: expected },
      { name: 'got', value: got },
    ],
  };
}

export function TideNameErrorUnknownConstant_builder(
  name: string,
): TideNameErrorUnknownConstant {
  return {
    kind: 'name-error',
    subkind: 'unknown_constant',
    args: [{ name: 'name', value: name }],
  };
}

export function TideNameErrorUnknownFunction_builder(
  name: string,
): TideNameErrorUnknownFunction {
  return {
    kind: 'name-error',
    subkind: 'unknown_function',
    args: [{ name: 'name', value: name }],
  };
}

export function TideNameErrorMultipleDefinition_builder(
  name: string,
): TideNameErrorMultipleDefinition {
  return {
    kind: 'name-error',
    subkind: 'multiple_definitions',
    args: [{ name: 'name', value: name }],
  };
}

export function TideNameErrorCyclicalDependencies_builder(
  names: string[],
): TideNameErrorCyclicalDependencies {
  return {
    kind: 'name-error',
    subkind: 'cyclical_dependencies',
    args: [{ name: 'names', value: names }],
  };
}

export function TideValueError_builder(name: string): TideValueError {
  return {
    kind: 'value-error',
    args: [{ name: 'name', value: name }],
  };
}

export function TideGenericError_builder(): TideGenericError {
  return {
    kind: 'generic',
  };
}
