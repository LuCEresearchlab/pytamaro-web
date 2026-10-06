export type TideError =
  | TideGenericError
  | TideSyntaxError
  | TideTypeError
  | TideNameError
  | TideRuntimeError;

export type TideSyntaxError =
  | TideSyntaxErrorInvalidConstantIdentifier
  | TideSyntaxErrorInvalidFunctionIdentifier
  | TideSyntaxErrorConstantHasNoValue
  | TideSyntaxErrorInvalidLiteral
  | TideSyntaxErrorMissingParameter;

export type TideNameError =
  | TideNameErrorMultipleDefinition
  | TideNameErrorUnknownConstant
  | TideNameErrorUnknownFunction
  | TideNameErrorCyclicalDependencies
  | TideNameErrorNodeKindMismatch;

export interface TideSyntaxErrorInvalidConstantIdentifier {
  kind: 'syntax-error';
  subkind: 'invalid_constant_identifier';
  args: [{ name: 'name'; value: string }];
}

export interface TideSyntaxErrorInvalidFunctionIdentifier {
  kind: 'syntax-error';
  subkind: 'invalid_function_identifier';
  args: [{ name: 'name'; value: string }];
}

export interface TideNameErrorNodeKindMismatch {
  kind: 'name-error';
  subkind: 'node_kind_mismatch';
  args: [
    { name: 'name'; value: string },
    { name: 'expected_kind'; value: string },
    { name: 'got_kind'; value: string },
  ];
}

export interface TideSyntaxErrorInvalidLiteral {
  kind: 'syntax-error';
  subkind: 'invalid_literal';
  args: [{ name: 'value'; value: string }];
}

export interface TideSyntaxErrorConstantHasNoValue {
  kind: 'syntax-error';
  subkind: 'constant_has_no_value';
  args: [{ name: 'name'; value: string }];
}

export interface TideSyntaxErrorMissingParameter {
  kind: 'syntax-error';
  subkind: 'missing_parameter';
  args: [{ name: 'name'; value: string }];
}

export interface TideTypeError {
  kind: 'type-error';
  args: [
    { name: 'expected'; value: string },
    { name: 'got'; value: string },
    { name: 'handle'; value: string },
  ];
}

export interface TideNameErrorUnknownConstant {
  kind: 'name-error';
  subkind: 'unknown_constant';
  args: [{ name: 'name'; value: string }];
}

export interface TideNameErrorUnknownFunction {
  kind: 'name-error';
  subkind: 'unknown_function';
  args: [{ name: 'name'; value: string }];
}

export interface TideNameErrorMultipleDefinition {
  kind: 'name-error';
  subkind: 'multiple_definitions';
  args: [{ name: 'name'; value: string }];
}

export interface TideNameErrorCyclicalDependencies {
  kind: 'name-error';
  subkind: 'cyclical_dependencies';
  args: [{ name: 'names'; value: string[] }];
}

export interface TideRuntimeError {
  kind: 'runtime-error';
  args: [{ name: 'error'; value: string }];
}

export interface TideGenericError {
  kind: 'generic';
  args: [];
}
