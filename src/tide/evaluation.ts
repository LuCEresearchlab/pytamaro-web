// import { executeOnServer } from '../useActivity';
import axios from 'axios';
import { ExecutionResponse } from '../codeExecution';
import {
  EvaluatedTamaroCard,
  FunctionParameter,
  TamaroCard,
  TamaroCardParameterEnvironment,
} from './cards';
import { create_code } from './code';
import {
  Context,
  Definition,
  EvaluatedContext,
  EvaluatedDefinition,
  get_constant_type,
} from './context';
import {
  TideGenericError_builder,
  TideNameErrorCyclicalDependencies_builder,
  TideNameErrorMultipleDefinition_builder,
  TideNameErrorUnknownConstant_builder,
  TideNameErrorUnknownFunction_builder,
  TideRuntimeError_builder,
  TideSyntaxErrorConstantHasNoValue_builder,
  TideSyntaxErrorInvalidConstantIdentifier_builder,
  TideSyntaxErrorInvalidFunctionIdentifier_builder,
  TideSyntaxErrorInvalidLiteral_builder,
  TideSyntaxErrorMissingParameter_builder,
  TideSyntaxErrorNodeKindMismatch_builder,
  TideTypeError_builder,
} from './error_builders';
import { TideError } from './errors';
import {
  compareLocation,
  ExpressionValue,
  IExpressionValue,
  Location,
  SoundType,
  type_equality_rule,
  type_toString,
  UnsoundType,
  Value,
} from './expression';
import { extract_data } from './data_extraction';
import { eqLocation } from './utils';

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

export async function executeOnServer(
  source: string,
): Promise<ExecutionResponse> {
  try {
    const response = await axios.post('/api/execute', {
      sources: [source],
      idx: 0,
      toolboxFunctions: [],
      extraPythonFiles: [],
    });
    return response.data;
  } catch {
    return { type: 'network-error' };
  }
}

type DefinitionWithImports<U> = Definition<U> & {
  dependencies: Location[];
};
type ContextWithImports<U> = DefinitionWithImports<U>[];

function is_cylicaly_defined<U>(
  def: DefinitionWithImports<U>,
  context: ContextWithImports<U>,
): Location[] | undefined {
  const seen: Set<Location> = new Set();
  const stack: Location[][] = def.dependencies.map((v) => [v]);

  while (stack.length !== 0) {
    const is = stack.pop()!;
    const i = is[0];

    if (eqLocation(i, def.import)) return is;
    if (seen.has(i)) continue;

    const el = context.find((v) => eqLocation(v.import, i));
    if (el == null) continue;

    stack.push(...el.dependencies.map((v) => [v, ...is]));
  }

  return undefined;
}

export function sort_dependencies<T>(
  values: T[],
  get_position: (v: T) => Location,
  get_dependencies: (v: T) => Location[],
  get_element: (v: Location) => T | undefined,
): T[] {
  const stack = Array.from(values);
  const depth_order: T[] = [];
  const seen = new Set<Location>();

  while (stack.length !== 0) {
    const element = stack.pop()!;
    const i = get_position(element);

    if (seen.has(i)) continue;

    depth_order.push(element);
    const values = get_dependencies(element)
      .map(get_element)
      .filter((v) => v)
      .map((v) => v!);
    stack.unshift(...values);
  }
  return depth_order.reverse();
}

function sort_context_by_dependency<U>(
  context: ContextWithImports<U>,
): [ContextWithImports<U>, EvaluatedContext<U>] {
  const [stack, cyclical] = context
    .map((v) => ({ value: v, cyclical: is_cylicaly_defined(v, context) }))
    .reduce(
      (a, b) =>
        b.cyclical
          ? [a[0], a[1].concat([b.cyclical, b.value])]
          : [a[0].concat(b.value), a[1]],
      [
        [] as ContextWithImports<U>,
        [] as [Location[], DefinitionWithImports<U>][],
      ],
    );

  const evaluated_cyclical: EvaluatedContext<U> = cyclical.map(
    (v) =>
      ({
        ...v[1],
        evaluated: true,
        value: {
          type: -1,
          error: TideNameErrorCyclicalDependencies_builder(
            v[0].map((v) => v.name),
          ),
        },
      }) as EvaluatedDefinition<U>,
  );

  return [
    sort_dependencies(
      stack,
      (v) => v.import,
      (v) => v.dependencies,
      (v) => context.find((o) => eqLocation(o.import, v)),
    ),
    evaluated_cyclical,
  ];
}

export function find_dependencies<U>(
  value: TamaroCard<TamaroCardParameterEnvironment, U>,
  context: EvaluatedContext<U>,
): Location[] {
  function aux(
    value: TamaroCard<TamaroCardParameterEnvironment, U>,
  ): Location[] {
    switch (value.kind) {
      case 'constant_use':
        return [value.import];
      case 'literal':
        return [];
      case 'function_use':
        return Array.from(value.children.values())
          .map((v) => aux(v))
          .reduce((a, b) => a.concat(b), [value.import])
          .sort(compareLocation);
      // case 'parameter_use':
      //   return [];
    }
  }
  if (context.length === 0) return aux(value);
  return sort_dependencies(
    aux(value),
    (v) => v,
    (v) => context.find((o) => eqLocation(o.import, v))?.dependencies || [],
    (v) => v,
  );
}

export function check_identifier_name(name: string): boolean {
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

export async function evaluate_tree<
  T extends TamaroCardParameterEnvironment,
  U,
>(
  root: TamaroCard<T, U>,
  context: EvaluatedContext<U>,
): Promise<EvaluatedTamaroCard<T, U>> {
  if (root.evaluated) return root;
  function returning_error(
    error: false | TideError | TideError[],
    children?: Map<string, EvaluatedTamaroCard<T, U>>,
  ) {
    if (root.kind === 'function_use') {
      return {
        ...root,
        children: children || root.children,
        evaluated: true,
        value: { type: -1, error },
      } as EvaluatedTamaroCard<T, U>;
    }
    return {
      ...root,
      evaluated: true,
      value: { type: -1, error },
    } as EvaluatedTamaroCard<T, U>;
  }

  switch (root.kind) {
    case 'constant_use': {
      if (!check_identifier_name(root.import.name))
        return returning_error(
          TideSyntaxErrorInvalidConstantIdentifier_builder(root.import.name),
        );
      if (!context.find((o) => eqLocation(o.import, root.import)))
        return returning_error(
          TideNameErrorUnknownConstant_builder(root.import.name),
        );
      const value = context.find((o) => eqLocation(o.import, root.import))!;
      if (value.kind === 'function_definition')
        return returning_error(
          TideSyntaxErrorNodeKindMismatch_builder('constant', 'function'),
        );
      const constant_type = get_constant_type(value);
      if (constant_type === UnsoundType.Bottom) {
        return returning_error(false);
      }

      return {
        ...root,
        evaluated: true,
        value: {
          data: await extract_data(value.import.name, constant_type, [value]),
          type: constant_type,
          value: { expression: value.import.name, imports: [value.import] },
        } as unknown as ExpressionValue,
      };
    }
    case 'literal': {
      if (root.type === -1)
        return returning_error(
          TideSyntaxErrorInvalidLiteral_builder(root.str_value),
        );
      return {
        ...root,
        evaluated: true,
        value: {
          data: undefined,
          type: root.type,
          value: { expression: root.str_value, imports: [] },
        },
      } as EvaluatedTamaroCard<T, U>;
    }
    case 'function_use': {
      if (!check_identifier_name(root.import.name))
        return returning_error(
          TideSyntaxErrorInvalidFunctionIdentifier_builder(root.import.name),

          new Map(
            await Promise.all(
              root.children
                .entries()
                .map(
                  async ([k, v]): Promise<
                    [string, EvaluatedTamaroCard<T, U>]
                  > => [k, await evaluate_tree(v, context)],
                ),
            ),
          ),
        );
      if (!context.find((o) => eqLocation(o.import, root.import)))
        return returning_error(
          TideNameErrorUnknownFunction_builder(root.import.name),
          new Map(
            await Promise.all(
              root.children
                .entries()
                .map(
                  async ([k, v]): Promise<
                    [string, EvaluatedTamaroCard<T, U>]
                  > => [k, await evaluate_tree(v, context)],
                ),
            ),
          ),
        );
      const definition = context.find((o) =>
        eqLocation(o.import, root.import),
      )!;
      if (definition.kind === 'constant_definition')
        return returning_error(
          TideSyntaxErrorNodeKindMismatch_builder('function', 'constant'),
          new Map(
            await Promise.all(
              root.children
                .entries()
                .map(
                  async ([k, v]): Promise<
                    [string, EvaluatedTamaroCard<T, U>]
                  > => [k, await evaluate_tree(v, context)],
                ),
            ),
          ),
        );

      // For now all functions have a return value
      // if (definition.return_type === UnsoundType.Bottom) {
      //   return returning_error(
      //     false,
      //     await Promise.all(
      //       Array.from(root.children.values()).map((v) =>
      //         evaluate_tree(v, context),
      //       ),
      //     ),
      //   );
      // }
      const args = await Promise.all(
        definition.parameters.map(async (v) => {
          const arg = root.children.get(v.name);
          return {
            parameter: v,
            arg: arg ? await evaluate_tree(arg, context) : undefined,
          };
        }),
      );
      const missing_parameters = args.filter((v) => !v.arg);
      if (missing_parameters.length !== 0)
        return returning_error(
          missing_parameters.map(
            (v) => TideSyntaxErrorMissingParameter_builder(v.parameter.name),
            args.filter((v) => v).map((v) => v.arg!),
          ),
        );

      const bottom_args = args.filter(
        (v) => v.arg!.value.type === UnsoundType.Bottom,
      );

      if (bottom_args.length !== 0) {
        return returning_error(
          false,
          new Map(
            args.filter((v) => v.arg).map((v) => [v.parameter.name, v.arg!]),
          ),
        );
      }

      const typed_args: [
        boolean,
        { parameter: FunctionParameter; arg?: EvaluatedTamaroCard<T, U> },
      ][] = args.map(
        (
          v,
        ): [
          boolean,
          { parameter: FunctionParameter; arg?: EvaluatedTamaroCard<T, U> },
        ] =>
          type_equality_rule(v.arg!.value.type, v.parameter.type)
            ? [true, v]
            : [false, v],
      );

      const mismatch_types = typed_args.filter((v) => !v[0]);
      if (mismatch_types.length !== 0)
        return returning_error(
          mismatch_types.map((v) =>
            TideTypeError_builder(
              type_toString(v[1].arg!.value.type as SoundType),
              type_toString(v[1].parameter.type as SoundType),
            ),
          ),
          new Map(
            args.filter((v) => v.arg).map((v) => [v.parameter.name, v.arg!]),
          ),
        );

      const checked_args = typed_args.map((v) => ({
        ...v!,
        arg: v[1]!.arg!.value as IExpressionValue,
      }));

      const expression = `${definition.import.name}(${checked_args.map((v) => v.arg.value.expression).join(', ')})`;

      const imports = Array.from(
        new Set(
          checked_args
            .map((v) => v.arg.value.imports)
            .reduce((a, b) => a.concat(b), [definition.import]),
        ),
      ).sort(compareLocation);

      const children = new Map(args.map((v) => [v.parameter.name, v.arg!]));

      const value: ExpressionValue = {
        type: definition.return_type,
        value: {
          expression,
          imports,
        },
        data: undefined,
      };

      const card: EvaluatedTamaroCard<T, U> = {
        ...root,
        children,
        evaluated: true,
        value,
      };

      const dependencies = imports
        .map((v) => context.find((o) => eqLocation(o.import, v)))
        .filter((v) => v)
        .map((v) => v!);

      const code = create_code(value, dependencies);

      return await executeOnServer(code)
        .then(async (v) => {
          switch (v.type) {
            case 'success':
              return {
                ...card,
                value: {
                  ...value,
                  data: await extract_data(
                    expression,
                    definition.return_type,
                    dependencies,
                  ),
                },
              } as EvaluatedTamaroCard<T, U>;
            case 'error': {
              const content = v.stderr;
              const error_message = content.substring(
                content.lastIndexOf('Error: ') + 'Error: '.length,
              );
              return {
                ...card,
                value: {
                  type: -1,
                  error: TideRuntimeError_builder(error_message.trim()),
                },
              };
            }
            default:
              return {
                ...card,
                value: {
                  type: -1,
                  error: TideGenericError_builder(),
                },
              };
          }
        })
        .catch(() => {
          return {
            ...card,
            value: {
              type: -1,
              error: TideGenericError_builder(),
            },
          };
        });
    }
    // case 'parameter_use':
    //   return {
    //     ...root,
    //     evaluated: true,
    //     value: {
    //       data: undefined,
    //       type: root.parameter.type,
    //       value: { expression: root.parameter.name, imports: [] },
    //     },
    //   };
  }
}

export async function evaluate_context<U>(
  context: Context<U>,
): Promise<EvaluatedContext<U>> {
  const context_with_imports: ContextWithImports<U> = context.map((v) => {
    if (v.subkind === 'local')
      return {
        ...v,
        dependencies: v.root ? find_dependencies(v.root, []) : [],
      };
    return { ...v, dependencies: [] };
  });

  const [context_stack, evaluated] =
    sort_context_by_dependency(context_with_imports);

  const multiple_definitions: Location[] = [];
  while (context_stack.length !== 0) {
    const element = context_stack.pop()!;

    if (
      element.dependencies.find(
        (v) => !evaluated.find((o) => eqLocation(o.import, v)),
      )
    )
      throw new Error(
        'Error in evaluation logic, dependencies should be ordered from the least dependent to the most dependent',
      );
    if (element.subkind === 'imported') evaluated.push(element);
    else {
      if (element.kind === 'constant_definition') {
        const value: Value = element.root
          ? await evaluate_tree(element.root, evaluated).then((v) => v.value)
          : {
              type: -1,
              error: TideSyntaxErrorConstantHasNoValue_builder(
                element.import.name,
              ),
            };
        if (evaluated.find((o) => eqLocation(o.import, element.import))) {
          multiple_definitions.push(element.import);
        }
        evaluated.push({
          ...element,
          value,
          evaluated: true,
        });
      } else {
        throw new Error('Not supported Yet');
      }
    }
  }

  return evaluated.map((element) => {
    if (multiple_definitions.find((o) => eqLocation(o, element.import))) {
      return {
        ...element,
        dependencies: [],
        evaluated: true,
        evaluated_type: UnsoundType.Bottom,
        value: {
          type: -1,
          error: TideNameErrorMultipleDefinition_builder(element.import.name),
        },
      };
    }
    return element;
  });
}
