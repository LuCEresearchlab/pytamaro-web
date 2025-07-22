import axios from 'axios';
import { EvaluatedTamaroCard, TamaroCard } from './cards';
import { FunctionParameter } from './types';
import { create_code } from './code';
import {
  Definitions,
  Definition,
  EvaluatedDefinitions,
  get_definition_output_type,
  get_definition_dependencies,
} from './definitions';
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
import { ExpressionValue, IExpressionValue, Value } from './expression';
import { Location } from './types';
import { compareLocation } from './utils';
import {
  SoundType,
  type_equality_rule,
  type_toString,
  UnsoundType,
} from './typing';
import { extract_data, unwrap_local_definition } from './data_extraction';
import { eqLocation, inferRawValueType } from './utils';
import { ExecutionResponse } from '../../codeExecution';

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
type DefinitionsWithImports<U> = DefinitionWithImports<U>[];

function is_cylicaly_defined<U>(
  def: DefinitionWithImports<U>,
  context: DefinitionsWithImports<U>,
): Location[] | undefined {
  const seen: Set<Location> = new Set();
  const stack: Location[][] = def.dependencies.map((v) => [v]);

  while (stack.length !== 0) {
    const is = stack.pop()!;
    const i = is[0];

    if (eqLocation(i, def.location)) return is;
    if (seen.has(i)) continue;
    seen.add(i);

    const el = context.find((v) => eqLocation(v.location, i));
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
  const data_map = new Map<string, { value: T; order: number }>();
  let order = 0;
  function depth_first(value: T) {
    const key = get_position(value).module + '|' + get_position(value).name;
    if (data_map.has(key)) return;
    const children = get_dependencies(value)
      .map(get_element)
      .filter((v) => v)
      .map((v) => v!);

    // Prevent crash if the cyclical search failed
    data_map.set(key, {
      value,
      order: -1,
    });
    children.forEach((v) => depth_first(v));
    data_map.set(key, {
      value,
      order: order++,
    });
  }

  values.forEach((v) => depth_first(v));

  const topological_order = Array.from(data_map.values())
    .toSorted((a, b) => a.order - b.order)
    .map((v) => v.value);

  return topological_order;
}

function sort_context_by_dependency<U>(
  context: DefinitionsWithImports<U>,
): [DefinitionsWithImports<U>, EvaluatedDefinitions<U>] {
  const [stack, cyclical] = context
    .map((v) => ({ value: v, cyclical: is_cylicaly_defined(v, context) }))
    .reduce(
      (a, b) =>
        b.cyclical
          ? [a[0], a[1].concat([[b.cyclical, b.value]])]
          : [a[0].concat(b.value), a[1]],
      [
        [] as DefinitionsWithImports<U>,
        [] as [Location[], DefinitionWithImports<U>][],
      ],
    );

  const evaluated_cyclical: EvaluatedDefinitions<U> = cyclical.map((v) => ({
    ...v[1],
    evaluated: true,
    value: {
      type: UnsoundType.Bottom,
      error: TideNameErrorCyclicalDependencies_builder(v[0].map((v) => v.name)),
    },
  }));

  const sorted = sort_dependencies(
    stack,
    (v) => v.location,
    (v) => v.dependencies,
    (v) => {
      const value = context.find((o) => eqLocation(o.location, v));
      return value != null &&
        evaluated_cyclical.find((o) => eqLocation(o.location, v)) == null
        ? value
        : undefined;
    },
  );

  return [sorted, evaluated_cyclical];
}

export function find_dependencies<U>(
  value: TamaroCard<U>,
  context: EvaluatedDefinitions<U>,
): Location[] {
  function aux(value: TamaroCard<U>): Location[] {
    switch (value.kind) {
      case 'constant_use':
        return [value.location];
      case 'literal':
        return [];
      case 'function_use':
        return Array.from(value.children.values())
          .map((v) => aux(v))
          .reduce((a, b) => a.concat(b), [value.location])
          .sort(compareLocation);
      // case 'parameter_use':
      //   return [];
    }
  }
  if (context.length === 0) return aux(value);
  return sort_dependencies(
    aux(value),
    (v) => v,
    (v) =>
      get_definition_dependencies(
        context.find((o) => eqLocation(o.location, v)),
      ),
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

export async function evaluate_tree<U>(
  root: TamaroCard<U>,
  context: EvaluatedDefinitions<U>,
): Promise<EvaluatedTamaroCard<U>> {
  if (root.evaluated) return root;
  function returning_error(
    error: false | TideError | TideError[],
    children?: Map<string, EvaluatedTamaroCard<U>>,
  ) {
    if (root.kind === 'function_use') {
      return {
        ...root,
        children: children || root.children,
        evaluated: true,
        value: { type: UnsoundType.Bottom, error },
      } as EvaluatedTamaroCard<U>;
    }
    return {
      ...root,
      evaluated: true,
      value: { type: UnsoundType.Bottom, error },
    } as EvaluatedTamaroCard<U>;
  }

  switch (root.kind) {
    case 'constant_use': {
      if (!check_identifier_name(root.location.name))
        return returning_error(
          TideSyntaxErrorInvalidConstantIdentifier_builder(root.location.name),
        );
      if (!context.find((o) => eqLocation(o.location, root.location)))
        return returning_error(
          TideNameErrorUnknownConstant_builder(root.location.name),
        );
      const definition = context.find((o) =>
        eqLocation(o.location, root.location),
      )!;
      if (definition.kind === 'function_definition')
        return returning_error(
          TideSyntaxErrorNodeKindMismatch_builder('constant', 'function'),
        );
      const constant_type = get_definition_output_type(definition);
      if (constant_type === UnsoundType.Bottom) {
        return returning_error(false);
      }

      return {
        ...root,
        kind: 'constant_use',
        evaluated: true,
        value: {
          data: await extract_data(
            definition.location.name,
            constant_type,
            unwrap_local_definition([definition], context),
          ),
          type: constant_type,
          value: {
            expression: definition.location.name,
            imports: [definition.location],
          },
        },
      } as EvaluatedTamaroCard<U>;
    }
    case 'literal': {
      const type = inferRawValueType(root.str_value);
      if (type === UnsoundType.Bottom)
        return returning_error(
          TideSyntaxErrorInvalidLiteral_builder(root.str_value),
        );
      return {
        ...root,
        evaluated: true,
        value: {
          data: undefined,
          type: type,
          value: { expression: root.str_value, imports: [] },
        },
      };
    }
    case 'function_use': {
      if (!check_identifier_name(root.location.name))
        return returning_error(
          TideSyntaxErrorInvalidFunctionIdentifier_builder(root.location.name),

          new Map(
            await Promise.all(
              root.children
                .entries()
                .map(
                  async ([k, v]): Promise<[string, EvaluatedTamaroCard<U>]> => [
                    k,
                    await evaluate_tree(v, context),
                  ],
                ),
            ),
          ),
        );
      if (!context.find((o) => eqLocation(o.location, root.location)))
        return returning_error(
          TideNameErrorUnknownFunction_builder(root.location.name),
          new Map(
            await Promise.all(
              root.children
                .entries()
                .map(
                  async ([k, v]): Promise<[string, EvaluatedTamaroCard<U>]> => [
                    k,
                    await evaluate_tree(v, context),
                  ],
                ),
            ),
          ),
        );
      const definition = context.find((o) =>
        eqLocation(o.location, root.location),
      )!;
      if (definition.kind === 'constant_definition')
        return returning_error(
          TideSyntaxErrorNodeKindMismatch_builder('function', 'constant'),
          new Map(
            await Promise.all(
              root.children
                .entries()
                .map(
                  async ([k, v]): Promise<[string, EvaluatedTamaroCard<U>]> => [
                    k,
                    await evaluate_tree(v, context),
                  ],
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
          new Map(
            args.filter((v) => v.arg).map((v) => [v.parameter.name, v.arg!]),
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
        { parameter: FunctionParameter; arg?: EvaluatedTamaroCard<U> },
      ][] = args.map(
        (
          v,
        ): [
          boolean,
          { parameter: FunctionParameter; arg?: EvaluatedTamaroCard<U> },
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
              type_toString(v[1].parameter.type),
              v[1].parameter.name,
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

      const expression = `${definition.location.name}(${checked_args.map((v) => v.arg.value.expression).join(', ')})`;

      const imports = Array.from(
        new Set(
          checked_args
            .map((v) => v.arg.value.imports)
            .reduce((a, b) => a.concat(b), [definition.location]),
        ),
      ).sort(compareLocation);

      const children = new Map(args.map((v) => [v.parameter.name, v.arg!]));

      const value: ExpressionValue = {
        type: get_definition_output_type(definition) as SoundType,
        value: {
          expression,
          imports,
        },
        data: undefined,
      };

      const card: EvaluatedTamaroCard<U> = {
        ...root,
        children,
        evaluated: true,
        value,
      };

      const dependencies = imports
        .map((v) => context.find((o) => eqLocation(o.location, v)))
        .filter((v) => v)
        .map((v) => v!);

      const code = create_code(
        value,
        unwrap_local_definition(dependencies, context),
      );

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
                    get_definition_output_type(definition) as SoundType,
                    unwrap_local_definition(dependencies, context),
                  ),
                },
              } as EvaluatedTamaroCard<U>;
            case 'error': {
              const content = v.stderr;
              const error_message = content.substring(
                content.lastIndexOf('Error: ') + 'Error: '.length,
              );
              return {
                ...card,
                value: {
                  type: UnsoundType.Bottom,
                  error: TideRuntimeError_builder(error_message.trim()),
                },
              };
            }
            default:
              return {
                ...card,
                value: {
                  type: UnsoundType.Bottom,
                  error: TideGenericError_builder(),
                },
              };
          }
        })
        .catch(() => {
          return {
            ...card,
            value: {
              type: UnsoundType.Bottom,
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
  context: Definitions<U>,
): Promise<EvaluatedDefinitions<U>> {
  const context_with_imports: DefinitionsWithImports<U> = context.map((v) => {
    if (v.subkind === 'local')
      return {
        ...v,
        dependencies: v.root
          ? find_dependencies(v.root, []).filter(
              (v) => context.find((o) => eqLocation(o.location, v)) != null,
            )
          : [],
      };
    return { ...v, dependencies: [] };
  });

  const [context_stack, evaluated] =
    sort_context_by_dependency(context_with_imports);

  const multiple_definitions: Location[] = [];
  while (context_stack.length !== 0) {
    const element = context_stack.shift()!;

    if (
      element.dependencies.find(
        (v) => !evaluated.find((o) => eqLocation(o.location, v)),
      )
    )
      throw new Error(
        `Error in evaluation logic, dependencies should be ordered from the least dependent to the most dependent (error occurs because ${JSON.stringify(element.location)} depends on ${JSON.stringify(
          element.dependencies.find(
            (v) => !evaluated.find((o) => eqLocation(o.location, v)),
          ),
        )} which is not yet evaluated)`,
      );
    if (element.subkind === 'imported') evaluated.push(element);
    else {
      if (element.kind === 'constant_definition') {
        const tree = element.root
          ? await evaluate_tree(element.root, evaluated)
          : undefined;

        const value: Value = tree?.value || {
          type: UnsoundType.Bottom,
          error: TideSyntaxErrorConstantHasNoValue_builder(
            element.location.name,
          ),
        };
        if (evaluated.find((o) => eqLocation(o.location, element.location))) {
          multiple_definitions.push(element.location);
        }
        evaluated.push({
          ...element,
          root: element.root ? tree : undefined,
          value,
          evaluated: true,
        });
      } else {
        throw new Error('Not supported Yet');
      }
    }
  }

  return evaluated.map((element) => {
    if (multiple_definitions.find((o) => eqLocation(o, element.location))) {
      return {
        ...element,
        dependencies: [],
        evaluated: true,
        value: {
          type: UnsoundType.Bottom,
          error: TideNameErrorMultipleDefinition_builder(element.location.name),
        },
      };
    }
    return element;
  });
}
