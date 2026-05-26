/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ProgramState } from '.';
import { TamaroCard } from '../cards';
import {
  Definition,
  ImportedDefinition,
  LocalDefinition,
} from '../definitions';
import { CodeRepresentation, Location } from '../types';

type SourceState<U, Tlocal, Timport> = ProgramState<
  U,
  Tlocal,
  Timport,
  'code_element'
>;
type DestinationState<U, Tlocal, Timport> = ProgramState<
  U,
  Tlocal,
  Timport,
  'code_created'
>;

export function turnCodeElementToCode(
  code_element: CodeRepresentation,
  definitions: Definition<unknown, unknown, unknown, 'code_element'>[],
): string {
  function getDefinition(
    location: Location,
  ): Definition<unknown, unknown, unknown, 'code_element'> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (definitions as any).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => v.location.name === location.name,
    )! as Definition<unknown, unknown, unknown, 'code_element'>;
  }

  function getDependencies(location: Location): Location[] {
    const def = getDefinition(location);
    if ('error_phase' in def) return [];
    return def.code_element.imports;
  }

  function getCode(location: Location): string {
    const def = getDefinition(location);
    if ('error_phase' in def)
      throw new Error("Can't get the code of an invalid definition");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (def.code_element as any).definition;
  }

  const visited = new Set<string>();
  const sorted: string[] = [];

  function visit(location: Location) {
    if (visited.has(location.name)) return;
    visited.add(location.name);

    for (const dep of getDependencies(location)) {
      visit(dep);
    }

    sorted.push(getCode(location));
  }

  if ('imports' in code_element) {
    for (const dep of code_element.imports) {
      visit(dep);
    }
  }
  if ('location' in code_element) {
    visit(code_element.location);
  }

  const combinedCode = sorted.join('\n');

  if ('expression' in code_element) {
    return (combinedCode + '\n' + code_element.expression).trim();
  } else {
    return combinedCode.trim();
  }
}

export default function code_created_phase<U, Tlocal, Timport>(
  base: SourceState<U, Tlocal, Timport>,
): DestinationState<U, Tlocal, Timport> {
  const previous_definitions = base.imported_definitions
    .map((v) => v as Definition<U, Tlocal, Timport, 'code_element'>)
    .concat(base.local_definitions);

  function imported_definition_phase(
    def: ImportedDefinition<Timport, 'code_element'>,
  ): ImportedDefinition<Timport, 'code_created'> {
    if ('error_phase' in def) return def;

    return {
      ...def,
      code: turnCodeElementToCode(def.code_element, previous_definitions),
    };
  }

  function local_definition_phase(
    def: LocalDefinition<U, Tlocal, 'code_element'>,
  ): LocalDefinition<U, Tlocal, 'code_created'> {
    const root = def.root ? expression_phase(def.root) : undefined;
    if ('error_phase' in def) return { ...def, root };

    if (!root || 'error_phase' in root) {
      throw new Error('Error should have been recorded previously');
    }

    return {
      ...def,
      root,
      code: turnCodeElementToCode(def.code_element, previous_definitions),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  function expression_phase(
    exp: TamaroCard<U, 'code_element'>,
  ): TamaroCard<U, 'code_created'> {
    switch (exp.kind) {
      case 'function_use': {
        const children = new Map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (exp.children as any)
            .entries()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(([k, v]: any) => [k, expression_phase(v)]),
        ) as Map<string, TamaroCard<U, 'code_created'>>;

        if ('error_phase' in exp) return { ...exp, children };
        if (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (children.values() as any).find((v: any) => 'error_phase' in v) as any
        ) {
          throw new Error('Error should have been recorded previously');
        }

        return {
          ...exp,
          children,
          code: turnCodeElementToCode(exp.code_element, previous_definitions),
        };
      }
      case 'constant_use': {
        if ('error_phase' in exp) return exp;
        return {
          ...exp,
          code: turnCodeElementToCode(exp.code_element, previous_definitions),
        };
      }
      case 'literal': {
        if ('error_phase' in exp) return exp;
        return {
          ...exp,
          code: turnCodeElementToCode(exp.code_element, previous_definitions),
        };
      }
    }
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expressions: (base.expressions as any).map(expression_phase) as TamaroCard<
      U,
      'code_created'
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
