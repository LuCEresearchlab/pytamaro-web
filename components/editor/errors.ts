export function simplifyLiterals(message: string) {
  // Ty supports IntLiteral, BooleanLiteral, StringLiteral, BytesLiteral, EnumLiteral.
  // See https://github.com/astral-sh/ruff/blob/bff32a41dc440b30764e9414767794e01d25c265/crates/ty_python_semantic/src/types/display.rs#L252-L258
  // The first three are common even in student code, so we simplify them here
  // to their "base" type.
  return (
    message
      // IntLiteral (`Literal[123]` -> `int`)
      .replaceAll(/`Literal\[([-+]?\d+)\]`/g, '`int`')
      // BooleanLiteral (`Literal[True]` -> `bool`)
      .replaceAll(/`Literal\[(True|False)\]`/g, '`bool`')
      // StringLiteral (`Literal['abc']` -> `str`)
      .replaceAll(/`Literal\["(.*?)"\]`/g, '`str`')
  );
}

export function convertMarkdownToCodeTag(message: string) {
  // Content may include backticks for code spans, find them and replace with <code> elements.
  // Non-greedy match to find all code spans.
  return message.replaceAll(
    /`(.*?)`/g,
    '<code style="background-color: #ffffff38;">$1</code>',
  );
}

export function removeRedundantCategory(message: string): string {
  // If the message already starts with the category name, remove it to avoid redundancy.
  const colonIdx = message.indexOf(':');
  const possiblePrefix = colonIdx !== -1 ? message.substring(0, colonIdx) : '';
  if (['SyntaxError', 'NameError', 'TypeError'].includes(possiblePrefix)) {
    return message.substring(colonIdx + 1).trimStart();
  }
  return message;
}

export enum ErrorCategory {
  SyntaxError,
  NameError,
  TypeError,
  Other,
}

export function displayErrorCategory(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.SyntaxError:
      return 'Syntax Error';
    case ErrorCategory.NameError:
      return 'Name Error';
    case ErrorCategory.TypeError:
      return 'Type Error';
    default:
      return '';
  }
}

export function runtimeErrorMessageCategory(message: string): ErrorCategory {
  const prefix = message.split(':')[0];
  switch (prefix) {
    case 'SyntaxError':
      return ErrorCategory.SyntaxError;
    case 'NameError':
      return ErrorCategory.NameError;
    case 'TypeError':
      return ErrorCategory.TypeError;
    default:
      return ErrorCategory.Other;
  }
}

export function staticErrorMessageCategory(ty_code: string): ErrorCategory {
  // Map ty codes (https://docs.astral.sh/ty/reference/rules)
  // to known categories for errors.
  switch (ty_code) {
    case 'invalid-syntax':
      return ErrorCategory.SyntaxError;
    case 'undefined-reveal':
    case 'unresolved-reference':
    case 'possibly-unresolved-reference':
      return ErrorCategory.NameError;
    case 'call-non-callable':
    case 'conflicting-metaclass':
    case 'duplicate-base':
    case 'inconsistent-mro':
    case 'instance-layout-conflict':
    case 'invalid-await':
    case 'invalid-base':
    case 'invalid-context-manager':
    case 'invalid-exception-caught':
    case 'invalid-metaclass':
    case 'invalid-named-tuple':
    case 'invalid-protocol':
    case 'invalid-range':
    case 'invalid-raise':
    case 'invalid-super-argument':
    case 'missing-argument':
    case 'no-matching-overload':
    case 'non-subscriptable':
    case 'non-iterable':
    case 'parameter-already-assigned':
    case 'positional-only-parameter-as-kwarg':
    case 'too-many-positional-arguments':
    case 'unknown-argument':
    case 'unsupported-operator':
    case 'possibly-missing-implicit-call':
      return ErrorCategory.TypeError;
    default:
      return ErrorCategory.Other;
  }
}
