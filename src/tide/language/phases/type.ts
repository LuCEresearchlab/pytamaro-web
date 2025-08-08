import { ProgramState } from '.';
import { TamaroCard } from '../cards';
import {
  ConstantDefinition,
  Definition,
  FunctionDefinition,
  ImportedDefinition,
  LocalDefinition,
} from '../definitions';
import { TideTypeError_builder } from '../error_builders';
import {
  SoundType,
  type_equality_rule,
  type_toString,
  ValueType,
} from '../typing';

type SourceState<U, Tlocal, Timport> = ProgramState<
  U,
  Tlocal,
  Timport,
  'name_checked'
>;
type DestinationState<U, Tlocal, Timport> = ProgramState<
  U,
  Tlocal,
  Timport,
  'type_checked'
>;

export default function type_checked_phase<U, Tlocal, Timport>(
  base: SourceState<U, Tlocal, Timport>,
): DestinationState<U, Tlocal, Timport> {
  const previous_definitions = base.imported_definitions
    .map((v) => v as Definition<U, Tlocal, Timport, 'name_checked'>)
    .concat(base.local_definitions);

  const nameToDefinition = new Map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (previous_definitions as any).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => [v.location.name, v] as any,
    ) as [string, Definition<U, Tlocal, Timport, 'name_checked'>][],
  );

  function imported_definition_phase(
    def: ImportedDefinition<Timport, 'name_checked'>,
  ): ImportedDefinition<Timport, 'type_checked'> {
    return def;
  }

  function local_definition_phase(
    def: LocalDefinition<U, Tlocal, 'name_checked'>,
  ): LocalDefinition<U, Tlocal, 'type_checked'> {
    const root = def.root ? expression_phase(def.root) : undefined;
    if ('error_phase' in def) return { ...def, root };

    if (!root || 'error_phase' in root) {
      return {
        ...def,
        root,
        error_phase: 'type_checked',
        type: false,
      };
    }

    return {
      ...def,
      root,
      type: root.type,
    };
  }

  const computed_definition: Map<
    string,
    Definition<U, Tlocal, Timport, 'type_checked'>
  > = new Map();

  function definition_phase_cache(
    def: Definition<U, Tlocal, Timport, 'name_checked'>,
  ): Definition<U, Tlocal, Timport, 'type_checked'> {
    const cached = computed_definition.get(def.location.name);
    if (cached) return cached;
    const value =
      def.subkind === 'local'
        ? local_definition_phase(def)
        : imported_definition_phase(def);
    computed_definition.set(def.location.name, value);
    return value;
  }

  function expression_phase(
    exp: TamaroCard<U, 'name_checked'>,
  ): TamaroCard<U, 'type_checked'> {
    switch (exp.kind) {
      case 'function_use': {
        const children = new Map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (Array.from(exp.children.entries()) as any).map(
            ([k, v]: [string, TamaroCard<U, 'name_checked'>]) => [
              k,
              expression_phase(v) as TamaroCard<U, 'type_checked'>,
            ],
          ) as [string, TamaroCard<U, 'type_checked'>][],
        );

        if ('error_phase' in exp) return { ...exp, children };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((children.values() as any).find((v: any) => 'error_phase' in v)) {
          return {
            ...exp,
            children,
            error_phase: 'type_checked',
            type: false,
          };
        }

        const function_def = definition_phase_cache(
          nameToDefinition.get(exp.location.name)!,
        ) as FunctionDefinition<U, Tlocal, Timport, 'type_checked'>;

        if ('error_phase' in function_def && function_def.error_phase)
          return {
            ...exp,
            children,
            error_phase: 'type_checked',
            type: false,
          };

        const type = function_def.type;
        const parameters = new Map(
          function_def.parameters.map((v) => [v.name, v.type as ValueType]),
        );

        const type_checked = Array.from(
          parameters
            .keys()
            .map((v): [ValueType, ValueType, string] => [
              parameters.get(v)!,
              children.get(v)?.type || false,
              v,
            ]),
        );

        const type_mismatch = type_checked.filter(
          (v) => !type_equality_rule(v[0], v[1]),
        );
        if (type_mismatch.length !== 0) {
          return {
            ...exp,
            children,
            error_phase: 'type_checked',
            type: {
              error: type_mismatch.map((v) =>
                TideTypeError_builder(
                  type_toString(v[0] as SoundType),
                  type_toString(v[1] as SoundType),
                  v[2],
                ),
              ),
            },
          };
        }

        return {
          ...exp,
          children: children,
          parameters: function_def.parameters,
          type,
        };
      }
      case 'constant_use': {
        if ('error_phase' in exp) return exp;
        const constant_def = definition_phase_cache(
          nameToDefinition.get(exp.location.name)!,
        ) as ConstantDefinition<U, Tlocal, Timport, 'type_checked'>;

        if ('error_phase' in constant_def)
          return {
            ...exp,
            error_phase: 'type_checked',
            type: false,
          };

        const type = constant_def.type;
        return { ...exp, type };
      }
      case 'literal': {
        if ('error_phase' in exp) return exp;
        return exp;
      }
    }
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expressions: (base.expressions as any).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expression_phase as any,
    ) as TamaroCard<U, 'type_checked'>[],
    imported_definitions: base.imported_definitions.map(
      imported_definition_phase,
    ),
    local_definitions: base.local_definitions.map(local_definition_phase),
  };
}
