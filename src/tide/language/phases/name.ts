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
import { eqLocation, locationKey } from '../utils';

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

export default function name_checked_phase<U, Tlocal, Timported>(
  base: SourceState<U, Tlocal, Timported>,
): DestinationState<U, Tlocal, Timported> {
  const previous_definitions = base.imported_definitions
    .map((v) => v as Definition<U, Tlocal, Timported, 'syntax_checked'>)
    .concat(base.local_definitions);

  const definitions = previous_definitions as Definition<
    U,
    Tlocal,
    Timported,
    'syntax_checked'
  >[];

  // Same-named imports from different modules are fine; a clash only
  // matters when a local definition is involved
  const multiply_defined = Array.from(
    new Set(definitions.map((v) => v.location.name)),
  ).filter((name) => {
    const same_name = definitions.filter((v) => v.location.name === name);
    return (
      same_name.length >= 2 && same_name.some((v) => v.subkind === 'local')
    );
  });

  const definitionsByLocation = new Map(
    definitions.map((v) => [locationKey(v.location), v]),
  );

  // Uses carry the module they were picked from; the ones without
  // (e.g. local constants) are resolved by name alone
  function resolve(name: string, module?: string) {
    if (module !== undefined)
      return definitionsByLocation.get(locationKey({ module, name }));
    if (multiply_defined.includes(name)) return undefined;
    return definitions.find((v) => v.location.name === name);
  }

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
    const root = def.root ? expression_phase(def.root) : undefined;
    if ('error_phase' in def) return { ...def, root };

    const cycle = is_cylicaly_defined(
      def as Definition<U, Tlocal, Timported, 'syntax_checked'>,
      def.location,
      (v) =>
        'dependencies' in v
          ? v.dependencies
              .map((v) => resolve(v))
              .map((v) => (v && 'location' in v ? v.location : undefined))
              .filter((v) => v)
              .map((v) => v!)
              .filter((v) => !multiply_defined.includes(v.name))
          : [],
      (v) => definitionsByLocation.get(locationKey(v)),
    );
    if (cycle) {
      return {
        ...def,
        root,
        error_phase: 'name_checked',
        type: {
          error: TideNameErrorCyclicalDependencies_builder(
            cycle.map((v) => v.name),
          ),
        },
      };
    }

    if (!root || 'error_phase' in root) {
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
        root,
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
        .map((v) => resolve(v))
        .filter((v) => v)
        .map((v) => v!.location),
    };
  }

  function local_definition_phase_cache(
    def: LocalDefinition<U, Tlocal, 'syntax_checked'>,
  ): LocalDefinition<U, Tlocal, 'name_checked'> {
    const cached = computed_definition.get(locationKey(def.location));
    if (cached) return cached;
    const value = local_definition_phase(def);
    computed_definition.set(locationKey(def.location), value);
    return value;
  }

  function expression_phase(
    exp: TamaroCard<U, 'syntax_checked'>,
  ): TamaroCard<U, 'name_checked'> {
    switch (exp.kind) {
      case 'function_use': {
        const children = new Map<string, TamaroCard<U, 'name_checked'>>(
          Array.from(
            exp.children,
            ([k, v]): [string, TamaroCard<U, 'name_checked'>] => [
              k,
              expression_phase(v),
            ],
          ),
        );

        if ('error_phase' in exp) return { ...exp, children };

        if (Array.from(children.values()).find((v) => 'error_phase' in v)) {
          return {
            ...exp,
            children,
            error_phase: 'name_checked',
            type: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any;
        }

        const definition = resolve(exp.function_name, exp.module);
        const location = definition?.location;

        if (!definition || !location) {
          return {
            ...exp,
            children,
            error_phase: 'name_checked',
            type: {
              error: TideNameErrorUnknownFunction_builder(exp.function_name),
            },
          };
        }

        if (definition.kind !== 'function_definition') {
          return {
            ...exp,
            children,
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
            children,
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
            return {
              ...exp,
              children,
              type: false,
              error_phase: 'name_checked',
            };
          }
        }

        return {
          ...exp,
          children,
          parameters,
          location,
        };
      }
      case 'constant_use': {
        const definition = resolve(exp.constant_name, exp.module);
        const location = definition?.location;

        if ('error_phase' in exp) return exp;
        if (!location) {
          return {
            ...exp,
            error_phase: 'name_checked',
            type: {
              error: TideNameErrorUnknownConstant_builder(exp.constant_name),
            },
          };
        }

        const def = definition!;
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
