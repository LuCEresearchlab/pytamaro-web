import { FunctionParameter, TamaroCard } from './cards';
import {
  Context,
  Definition,
  EvaluatedContext,
  EvaluatedDefinition,
} from './context';
import {
  ExpressionValue,
  Location,
  type_equality_rule,
  UnsoundType,
  Value,
} from './expression';

type DefinitionWithImports = Definition & {
  dependencies: Location[];
};
type ContextWithImports = DefinitionWithImports[];

function is_cylicaly_defined(
  def: DefinitionWithImports,
  context: ContextWithImports,
): boolean {
  const seen: Set<Location> = new Set();
  const stack: Location[] = def.dependencies;

  while (stack.length !== 0) {
    const i = stack.pop()!;

    if (i === def.import) return true;
    if (seen.has(i)) continue;

    const el = context.find((v) => v.import === i);
    if (el == null) continue;

    stack.push(...el.dependencies);
  }

  return false;
}

function sort_context_by_dependency(
  context: ContextWithImports,
): [ContextWithImports, EvaluatedContext] {
  const [stack, cyclical] = context
    .map((v) => ({ value: v, cyclical: is_cylicaly_defined(v, context) }))
    .reduce(
      (a, b) =>
        b.cyclical
          ? [a[0], a[1].concat(b.value)]
          : [a[0].concat(b.value), a[1]],
      [[], []] as ContextWithImports[],
    );

  const evaluated_cyclical: EvaluatedContext = new Map(
    cyclical
      .map(
        (v) =>
          ({
            ...v,
            evaluated: true,
            evaluated_type: UnsoundType.Bottom,
          }) as EvaluatedDefinition,
      )
      .map((v) => [v.import, v]),
  );

  const depth_order: DefinitionWithImports[] = [];
  const seen = new Set<Location>();

  while (stack.length !== 0) {
    const element = stack.pop()!;

    if (seen.has(element.import)) continue;

    depth_order.push(element);
    const values = element.dependencies
      .map((i) => context.find((v) => v.import === i))
      .filter((v) => v)
      .map((v) => v!);
    stack.unshift(...values);
  }

  return [depth_order.reverse(), evaluated_cyclical];
}

export function find_dependencies(
  value: TamaroCard<FunctionParameter[]>,
): Location[] {
  switch (value.kind) {
    case 'constant_use':
      return [value.import];
    case 'literal':
      return [];
    case 'function_use':
      return Array.from(value.children.values())
        .map((v) => find_dependencies(v))
        .reduce((a, b) => a.concat(b), [value.import]);
    case 'parameter_use':
      return [];
  }
}

export function evaluate_tree<T extends FunctionParameter[]>(
  root: TamaroCard<T>,
  context: EvaluatedContext,
): Value {
  switch (root.kind) {
    case 'constant_use': {
      if (!context.has(root.import)) return { type: -1 };
      const value = context.get(root.import)!;
      if (value.kind === 'function_definition') return { type: -1 };
      return {
        type: value.evaluated_type,
        value: { expression: value.import.name, imports: [value.import] },
      };
    }
    case 'literal':
      return root.type === -1
        ? { type: -1 }
        : { type: root.type, value: { expression: root.value, imports: [] } };
    case 'function_use': {
      if (!context.has(root.import)) return { type: -1 };
      const value = context.get(root.import)!;
      if (value.kind === 'constant_definition') return { type: -1 };
      const args = value.parameters.map((v) => {
        const arg = root.children.get(v.name);
        return {
          parameter: v,
          arg: arg ? evaluate_tree(arg, context) : undefined,
        };
      });
      if (args.find((v) => !v.arg)) return { type: -1 };
      const typed_args = args.map((v) =>
        type_equality_rule(v.arg!.type, v.parameter.type) ? v : undefined,
      );
      if (typed_args.find((v) => !v)) return { type: -1 };

      const checked_args = typed_args.map((v) => ({
        ...v!,
        arg: v!.arg! as ExpressionValue,
      }));

      const expression = `${value.import.name}(${checked_args.map((v) => v.arg.value.expression).join(', ')})`;

      const imports = checked_args
        .map((v) => v.arg.value.imports)
        .reduce((a, b) => a.concat(b), [value.import]);

      return {
        type: value.evaluated_type,
        value: {
          expression,
          imports,
        },
      };
    }
    case 'parameter_use':
      return {
        type: root.parameter.type,
        value: { expression: root.parameter.name, imports: [] },
      };
  }
}

export function evaluate_context(context: Context): EvaluatedContext {
  const context_with_imports: ContextWithImports = context.map((v) => {
    if (v.subkind === 'local')
      return { ...v, dependencies: find_dependencies(v.root) };
    return { ...v, dependencies: [] };
  });

  const [context_stack, evaluated] =
    sort_context_by_dependency(context_with_imports);

  while (context_stack.length !== 0) {
    const element = context_stack.pop()!;

    if (element.dependencies.find((v) => !evaluated.has(v)))
      throw new Error(
        'Error in evaluation logic, dependencies should be ordered from the least dependent to the most dependent',
      );
    if (element.subkind === 'imported') evaluated.set(element.import, element);
    else {
      if (element.kind === 'constant_definition') {
        const value = evaluate_tree(element.root, evaluated);
        evaluated.set(element.import, {
          ...element,
          value,
          evaluated: true,
          evaluated_type: value.type,
        });
      } else {
        throw new Error('Not supported Yet');
      }
    }
  }

  return evaluated;
}
