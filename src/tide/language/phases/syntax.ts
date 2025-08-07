import { ProgramState } from '.';
import { TamaroCard } from '../cards';
import { ImportedDefinition, LocalDefinition } from '../definitions';
import {
  TideSyntaxErrorConstantHasNoValue_builder,
  TideSyntaxErrorInvalidConstantIdentifier_builder,
  TideSyntaxErrorInvalidFunctionIdentifier_builder,
  TideSyntaxErrorInvalidLiteral_builder,
} from '../error_builders';
import { LiteralType, SoundType } from '../typing';

const KEYWORDS: string[] = [
  'False',
  'await',
  'else',
  'import',
  'pass',
  'None',
  'break',
  'except',
  'in',
  'raise',
  'True',
  'class',
  'finally',
  'is',
  'return',
  'and',
  'continue',
  'for',
  'lambda',
  'try',
  'as',
  'def',
  'from',
  'nonlocal',
  'while',
  'assert',
  'del',
  'global',
  'not',
  'with',
  'async',
  'elif',
  'if',
  'or',
  'yield',
];

function check_identifier_name(name: string): boolean {
  function letter(v: string): boolean {
    if (v.match(/[a-zA-Z_]/)) return true;
    const code = v.charCodeAt(0);
    return 0xa1 <= code && code <= 0x10ffff;
  }

  return (
    Array.from(name).find(
      (v, i) => !(letter(v) || (i !== 0 && v.match(/[0-9]/) != null)),
    ) == null &&
    !KEYWORDS.includes(name) &&
    !KEYWORDS.includes(name)
  );
}

export const BOOL_REGEX = /(True)|(False)/;
export const INT_REGEX = /^-?[0-9]+$/g;
export const FLOAT_REGEX = /^-?[0-9]+(\.[0-9]*)?$/g;
export const STR_REGEX = /^"([^\\"]|(\\")|\\\\)*"$/g;
function inferRawValueType(v: string): LiteralType | false {
  if (v.match(BOOL_REGEX)) return SoundType.Bool;
  if (v.match(STR_REGEX)) return SoundType.Str;
  if (v.match(INT_REGEX)) return SoundType.Int;
  if (v.match(FLOAT_REGEX)) return SoundType.Float;
  return false;
}

function dependencies_extraction<T>(
  value: TamaroCard<T, 'syntax_checked'>,
): string[] {
  if ('error_phase' in value) return [];
  switch (value.kind) {
    case 'function_use':
      return value.children
        .values()
        .map(dependencies_extraction)
        .toArray()
        .flat()
        .concat(value.function_name);
    case 'constant_use':
      return [value.constant_name];
    case 'literal':
      return [];
  }
}

export default function syntax_checked_phase<U, TLocal, Timported>(
  base: ProgramState<U, TLocal, Timported, 'constructed'>,
): ProgramState<U, TLocal, Timported, 'syntax_checked'> {
  function imported_definition_phase(
    def: ImportedDefinition<Timported, 'constructed'>,
  ): ImportedDefinition<Timported, 'syntax_checked'> {
    return def;
  }

  function local_definition_phase(
    def: LocalDefinition<U, TLocal, 'constructed'>,
  ): LocalDefinition<U, TLocal, 'syntax_checked'> {
    if (!def.root)
      return {
        ...def,
        error_phase: 'syntax_checked',
        type: {
          error: TideSyntaxErrorConstantHasNoValue_builder(def.location.name),
        },
      };
    const root = expression_phase(def.root);

    if ('error_phase' in root) {
      return {
        ...def,
        error_phase: 'syntax_checked',
        type: false,
      };
    }

    const dependencies = Array.from(
      new Set(dependencies_extraction(root)),
    ).toSorted();

    return {
      ...def,
      root,
      dependencies,
    };
  }

  function expression_phase(
    exp: TamaroCard<U, 'constructed'>,
  ): TamaroCard<U, 'syntax_checked'> {
    switch (exp.kind) {
      case 'function_use': {
        if (!check_identifier_name(exp.function_name)) {
          return {
            ...exp,
            error_phase: 'syntax_checked',
            type: {
              error: TideSyntaxErrorInvalidFunctionIdentifier_builder(
                exp.function_name,
              ),
            },
          };
        }
        const constructed_children = new Map(
          exp.children.entries().map(([k, v]) => [k, expression_phase(v)]),
        );

        if (constructed_children.values().find((v) => 'error_phase' in v)) {
          return {
            ...exp,
            error_phase: 'syntax_checked',
            type: false,
          };
        }

        return {
          ...exp,
          children: constructed_children,
        };
      }
      case 'constant_use': {
        if (!check_identifier_name(exp.constant_name)) {
          return {
            ...exp,
            error_phase: 'syntax_checked',
            type: {
              error: TideSyntaxErrorInvalidConstantIdentifier_builder(
                exp.constant_name,
              ),
            },
          };
        }

        return exp;
      }
      case 'literal': {
        const literal_type = inferRawValueType(exp.input);
        if (literal_type === false) {
          return {
            ...exp,
            error_phase: 'syntax_checked',
            type: {
              error: TideSyntaxErrorInvalidLiteral_builder(exp.input),
            },
          };
        }

        return { ...exp, type: literal_type };
      }
    }
  }

  return {
    expressions: base.expressions.map(expression_phase),
    imported_definitions: base.imported_definitions.map(
      imported_definition_phase,
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    local_definitions: (base.local_definitions as any).map((v: any) =>
      local_definition_phase(v),
    ) as LocalDefinition<U, TLocal, 'syntax_checked'>[],
  };
}
