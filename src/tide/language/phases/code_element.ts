/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ProgramState } from '.';
import { TamaroCard } from '../cards';
import { ImportedDefinition, LocalDefinition } from '../definitions';
import { Location } from '../types';

function dependencies_extraction<T>(
  value: TamaroCard<T, 'type_checked'>,
): Location[] {
  if ('error_phase' in value) return [];
  switch (value.kind) {
    case 'function_use':
      return Array.from(value.children.values(), (v) =>
        dependencies_extraction(v),
      )
        .flat()
        .concat(value.location);
    case 'constant_use':
      return [value.location];
    case 'literal':
      return [];
  }
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

type SourceState<U, Tlocal, Timport> = ProgramState<
  U,
  Tlocal,
  Timport,
  'type_checked'
>;
type DestinationState<U, Tlocal, Timport> = ProgramState<
  U,
  Tlocal,
  Timport,
  'code_element'
>;

export default function code_element_phase<U, Tlocal, Timport>(
  base: SourceState<U, Tlocal, Timport>,
): DestinationState<U, Tlocal, Timport> {
  function imported_definition_phase(
    def: ImportedDefinition<Timport, 'type_checked'>,
  ): ImportedDefinition<Timport, 'code_element'> {
    if ('error_phase' in def) {
      return def;
    }
    return {
      ...def,
      code_element: {
        definition: `from ${def.location.module} import ${def.location.name}`,
        location: def.location,
        imports: [],
      },
    };
  }

  function local_definition_phase(
    def: LocalDefinition<U, Tlocal, 'type_checked'>,
  ): LocalDefinition<U, Tlocal, 'code_element'> {
    const root = def.root ? expression_phase(def.root) : undefined;
    if ('error_phase' in def) return { ...def, root };

    if (!root || 'error_phase' in root) {
      throw new Error('Error should have been recorded previously');
    }

    return {
      ...def,
      root,
      code_element: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        definition: `${def.location.name} = ${(root.code_element as any).expression}`,
        location: def.location,
        imports: root.code_element.imports,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  function expression_phase(
    exp: TamaroCard<U, 'type_checked'>,
  ): TamaroCard<U, 'code_element'> {
    switch (exp.kind) {
      case 'function_use': {
        const children = new Map<string, TamaroCard<U, 'code_element'>>(
          Array.from(
            exp.children,
            ([k, v]): [string, TamaroCard<U, 'code_element'>] => [
              k,
              expression_phase(v),
            ],
          ),
        );

        if ('error_phase' in exp) return { ...exp, children };
        if (Array.from(children.values()).find((v) => 'error_phase' in v)) {
          throw new Error('Error should have been recorded previously');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const expression = `${exp.location.name}(${exp.parameters.map((v) => (children.get(v.name)! as any).code_element.expression as string)})`;
        return {
          ...exp,
          children: children,
          code_element: {
            expression,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            imports: (dependencies_extraction as any)(exp as any) as Location[],
          },
        };
      }
      case 'constant_use': {
        if ('error_phase' in exp) return exp;
        return {
          ...exp,
          code_element: {
            expression: exp.constant_name,
            imports: [exp.location],
          },
        };
      }
      case 'literal': {
        if ('error_phase' in exp) return exp;
        return {
          ...exp,
          code_element: {
            expression: exp.input,
            imports: [],
          },
        };
      }
    }
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expressions: (base.expressions as any).map(expression_phase) as TamaroCard<
      U,
      'code_element'
    >[],
    imported_definitions: base.imported_definitions.map(
      imported_definition_phase,
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    local_definitions: (base.local_definitions as any).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      local_definition_phase as any,
    ),
  };
}
