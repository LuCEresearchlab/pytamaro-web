import { TFunction } from 'next-i18next';

export function simplifyTypes(message: string) {
  // Ty supports IntLiteral, BooleanLiteral, StringLiteral, BytesLiteral, EnumLiteral.
  // See https://github.com/astral-sh/ruff/blob/bff32a41dc440b30764e9414767794e01d25c265/crates/ty_python_semantic/src/types/display.rs#L252-L258
  // The first three are common even in student code, so we simplify them here
  // to their "base" type.
  // Note that they may also appear nested, e.g., `list[Literal[123]]` -> `list[int]`
  // or `list[EllipsisType | Graphic] -> `list[... | Graphic]`.
  return message.replaceAll(
    // First, only replace inside backticks
    /`([^`]*)`/g,
    (_, insideBackticks) =>
      `\`${insideBackticks
        // IntLiteral (`Literal[123]` -> `int`)
        .replaceAll(/Literal\[([-+]?\d+)\]/g, 'int')
        // BooleanLiteral (`Literal[True]` -> `bool`)
        .replaceAll(/Literal\[(True|False)\]/g, 'bool')
        // StringLiteral (`Literal['abc']` -> `str`)
        .replaceAll(/Literal\["(.*?)"\]/g, 'str')
        // Moreover, we simplify `EllipsisType` to `...` to avoid confusion with PyTamaro's ellipse function and match the source code.
        .replaceAll(/EllipsisType/g, '...')}\``
        // Several functions in `math` use `SupportsFloat | SupportsIndex`, simplify to `int | float
        .replaceAll(/SupportsFloat \| SupportsIndex/g, 'int | float'),
  );
}

export function convertMarkdownToCodeTag(message: string) {
  // Content may include backticks for code spans, find them and replace with <code> elements.
  // Non-greedy match to find all code spans.
  return message.replaceAll(/`(.*?)`/g, `<code>$1</code>`);
}

export enum ErrorCategory {
  SyntaxError,
  NameError,
  TypeError,
  Other,
}

export function displayErrorCategory(
  category: ErrorCategory,
  t: TFunction,
): string {
  switch (category) {
    case ErrorCategory.SyntaxError:
      return t('errorCategory.syntax');
    case ErrorCategory.NameError:
      return t('errorCategory.name');
    case ErrorCategory.TypeError:
      return t('errorCategory.type');
    case ErrorCategory.Other:
      return t('errorCategory.other');
  }
}

export function runtimeErrorMessageCategory(message: string): ErrorCategory {
  const prefix = message.split(':')[0];
  switch (prefix) {
    case 'SyntaxError':
    case 'IndentationError':
    case 'TabError':
      return ErrorCategory.SyntaxError;
    case 'NameError':
    case 'ImportError':
    case 'UnboundLocalError':
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
    case 'unresolved-import':
      return ErrorCategory.NameError;
    case 'call-non-callable':
    case 'conflicting-metaclass':
    case 'duplicate-base':
    case 'inconsistent-mro':
    case 'instance-layout-conflict':
    case 'invalid-argument-type':
    case 'invalid-assignment':
    case 'invalid-attribute-access':
    case 'invalid-await':
    case 'invalid-base':
    case 'invalid-context-manager':
    case 'invalid-declaration':
    case 'invalid-exception-caught':
    case 'invalid-metaclass':
    case 'invalid-named-tuple':
    case 'invalid-parameter-default':
    case 'invalid-protocol':
    case 'invalid-raise':
    case 'invalid-return-type':
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
