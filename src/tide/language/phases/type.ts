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

type SourceState<U, T> = ProgramState<U, T, 'name_checked'>;
type DestinationState<U, T> = ProgramState<U, T, 'type_checked'>;

export default function type_pahse<U, T>(
  base: SourceState<U, T>,
): DestinationState<U, T> {
  const previous_definitions = base.imported_definitions
    .map((v) => v as Definition<U, T, 'name_checked'>)
    .concat(base.local_definitions);

  const nameToDefinition = new Map(
    previous_definitions.map((v) => [v.location.name, v]),
  );

  function imported_definition_phase(
    def: ImportedDefinition<T, 'name_checked'>,
  ): ImportedDefinition<T, 'type_checked'> {
    return def;
  }

  function local_definition_phase(
    def: LocalDefinition<U, 'name_checked'>,
  ): LocalDefinition<U, 'type_checked'> {
    if ('error_phase' in def) return def;

    const root = expression_phase(def.root);

    if ('error_phase' in root) {
      return {
        ...def,
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

  function definition_phase(
    def: Definition<U, T, 'name_checked'>,
  ): Definition<U, T, 'type_checked'> {
    if (def.subkind === 'imported') return imported_definition_phase(def);
    return local_definition_phase(def);
  }

  function expression_phase(
    exp: TamaroCard<U, 'name_checked'>,
  ): TamaroCard<U, 'type_checked'> {
    if ('error_phase' in exp) return exp;

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((children.values() as any).find((v: any) => 'error_phase' in v)) {
          return {
            ...exp,
            error_phase: 'type_checked',
            type: false,
          };
        }

        const function_def = definition_phase(
          nameToDefinition.get(exp.location.name)!,
        ) as FunctionDefinition<U, T, 'type_checked'>;

        const type = function_def.type;

        if ('error_phase' in function_def)
          return {
            ...exp,
            error_phase: 'type_checked',
            type: false,
          };

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
        const constant_def = definition_phase(
          nameToDefinition.get(exp.location.name)!,
        ) as ConstantDefinition<U, T, 'type_checked'>;

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
