import { ProgramState } from '.';
import { TamaroCard } from '../cards';
import {
  Definition,
  ImportedDefinition,
  LocalDefinition,
} from '../definitions';
import {
  TideNameErrorCyclicalDependencies_builder,
  TideNameErrorMultipleDefinition_builder,
  TideNameErrorUnknownConstant_builder,
  TideNameErrorUnknownFunction_builder,
  TideNameErrorNodeKindMismatch_builder,
  TideSyntaxErrorMissingParameter_builder,
} from '../error_builders';
import { Location } from '../types';
import { eqLocation } from '../utils';

function is_cylicaly_defined<T>(
  origin: T,
  origin_location: Location,
  get_dependencies: (v: T) => Location[],
  get_element: (v: Location) => T | undefined,
): Location[] | undefined {
  const seen: Set<Location> = new Set();
  const stack: Location[][] = get_dependencies(origin).map((v) => [v]);

  while (stack.length !== 0) {
    const is = stack.pop()!;
    const i = is[0];

    if (eqLocation(i, origin_location)) return is;
    if (seen.has(i)) continue;
    seen.add(i);

    const el = get_element(i);
    if (el == null) continue;

    stack.push(...get_dependencies(el).map((v) => [v, ...is]));
  }

  return undefined;
}

type SourceState<U, TLocal, Timported> = ProgramState<
  U,
  TLocal,
  Timported,
  'syntax_checked'
>;
type DestinationState<U, TLocal, Timported> = ProgramState<
  U,
  TLocal,
  Timported,
  'name_checked'
>;

export default function syntax_phase<U, Tlocal, Timported>(
  base: SourceState<U, Tlocal, Timported>,
): DestinationState<U, Tlocal, Timported> {
  const previous_definitions = base.imported_definitions
    .map((v) => v as Definition<U, Tlocal, Timported, 'syntax_checked'>)
    .concat(base.local_definitions);

  const used_names = Array.from(
    new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (previous_definitions as any).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (v: any) => v.location.name,
      ) as string[],
    ),
  );

  const multiply_defined = used_names.filter(
    (name) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (previous_definitions as any).filter((v: any) => v.location.name === name)
        .length >= 2,
  ) as string[];

  const nameToDefinition = new Map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (previous_definitions as any).map((v: any) => [v.location.name, v]),
  ) as Map<string, Definition<U, Tlocal, Timported, 'syntax_checked'>>;

  const computed_definition: Map<
    string,
    LocalDefinition<U, Tlocal, 'name_checked'>
  > = new Map();

  function imported_definition_phase(
    def: ImportedDefinition<Timported, 'syntax_checked'>,
  ): ImportedDefinition<Timported, 'name_checked'> {
    return def;
  }

  function local_definition_phase(
    def: LocalDefinition<U, Tlocal, 'syntax_checked'>,
  ): LocalDefinition<U, Tlocal, 'name_checked'> {
    if ('error_phase' in def) return def;

    const cycle = is_cylicaly_defined(
      def as Definition<U, Tlocal, Timported, 'syntax_checked'>,
      def.location,
      (v) =>
        'dependencies' in v
          ? v.dependencies
              .map((v) => nameToDefinition.get(v))
              .map((v) => (v && 'location' in v ? v.location : undefined))
              .filter((v) => v)
              .map((v) => v!)
              .filter((v) => !multiply_defined.includes(v.name))
          : [],
      (v) => nameToDefinition.get(v.name),
    );
    if (cycle) {
      return {
        ...def,
        error_phase: 'name_checked',
        type: {
          error: TideNameErrorCyclicalDependencies_builder(
            cycle.map((v) => v.name),
          ),
        },
      };
    }

    const root = expression_phase(def.root);

    if ('error_phase' in root) {
      return {
        ...def,
        root,
        error_phase: 'name_checked',
        type: false,
      };
    }

    if (multiply_defined.includes(def.location.name)) {
      return {
        ...def,
        error_phase: 'name_checked',
        type: {
          error: TideNameErrorMultipleDefinition_builder(def.location.name),
        },
      };
    }

    return {
      ...def,
      root,
      dependencies: def.dependencies
        .map((v) => nameToDefinition.get(v))
        .filter((v) => v)
        .map((v) => v!.location),
    };
  }

  function local_definition_phase_cache(
    def: LocalDefinition<U, Tlocal, 'syntax_checked'>,
  ): LocalDefinition<U, Tlocal, 'name_checked'> {
    const cached = computed_definition.get(def.location.name);
    if (cached) return cached;
    const value = local_definition_phase(def);
    computed_definition.set(def.location.name, value);
    return value;
  }

  function expression_phase(
    exp: TamaroCard<U, 'syntax_checked'>,
  ): TamaroCard<U, 'name_checked'> {
    if ('error_phase' in exp) return exp;

    switch (exp.kind) {
      case 'function_use': {
        const children = new Map(
          exp.children.entries().map(([k, v]) => [k, expression_phase(v)]),
        );

        if (children.values().find((v) => 'error_phase' in v)) {
          return {
            ...exp,
            children,
            error_phase: 'name_checked',
            type: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any;
        }

        const definition = nameToDefinition.get(exp.function_name);

        const location = !multiply_defined.includes(exp.function_name)
          ? definition?.location
          : undefined;

        if (!definition || !location) {
          return {
            ...exp,
            error_phase: 'name_checked',
            type: {
              error: TideNameErrorUnknownFunction_builder(exp.function_name),
            },
          };
        }

        if (definition.kind !== 'function_definition') {
          return {
            ...exp,
            error_phase: 'name_checked',
            type: {
              error: TideNameErrorNodeKindMismatch_builder(
                location.name,
                'function',
                'constant',
              ),
            },
          };
        }

        const parameters = definition.parameters;

        const missing_paramaeters = parameters
          .map((v) => v.name)
          .filter((o) => children.get(o) == null);

        if (missing_paramaeters.length !== 0) {
          return {
            ...exp,
            error_phase: 'name_checked',
            type: {
              error: missing_paramaeters.map(
                TideSyntaxErrorMissingParameter_builder,
              ),
            },
          };
        }

        if (definition.subkind === 'local') {
          const computed_def = local_definition_phase_cache(definition);

          if ('error_phase' in computed_def) {
            return { ...exp, type: false, error_phase: 'name_checked' };
          }
        }

        return {
          ...exp,
          children: children,
          parameters,
          location,
        };
      }
      case 'constant_use': {
        const location = !multiply_defined.includes(exp.constant_name)
          ? nameToDefinition.get(exp.constant_name)?.location
          : undefined;

        if (!location) {
          return {
            ...exp,
            error_phase: 'name_checked',
            type: {
              error: TideNameErrorUnknownConstant_builder(exp.constant_name),
            },
          };
        }

        const def = nameToDefinition.get(location.name)!;
        if (def?.kind !== 'constant_definition') {
          return {
            ...exp,
            error_phase: 'name_checked',
            type: {
              error: TideNameErrorNodeKindMismatch_builder(
                location.name,
                'function',
                'constant',
              ),
            },
          };
        }

        if (def.subkind === 'local') {
          const computed_def = local_definition_phase_cache(def);

          if ('error_phase' in computed_def) {
            return { ...exp, type: false, error_phase: 'name_checked' };
          }
        }

        return { ...exp, location };
      }
      case 'literal': {
        return exp;
      }
    }
  }

  return {
    expressions: base.expressions.map(expression_phase),
    imported_definitions: base.imported_definitions.map(
      imported_definition_phase,
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    local_definitions: (base.local_definitions as any).map(
      local_definition_phase_cache,
    ) as LocalDefinition<U, Tlocal, 'name_checked'>[],
  };
}
