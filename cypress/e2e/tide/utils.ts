import parse from '../../../src/tide/language/textual/parser';
import {
  default as construction_phase_constructor,
  fromProgramToUnconstructedState,
} from '../../../src/tide/language/textual/construction';
import { getDefaultContext } from './data';
import { TamaroCard } from '../../../src/tide/language/cards';
import { ProgramState, State } from '../../../src/tide/language/phases';
import { LocalDefinition } from '../../../src/tide/language/definitions';

function removeMetadataFromCard<S extends State>(
  value: TamaroCard<unknown, S>,
): TamaroCard<undefined, S> {
  switch (value.kind) {
    case 'function_use': {
      if ('children' in value) {
        const children = new Map(
          Array.from(
            value.children
              .entries()
              .map(([k, v]: [string, TamaroCard<unknown, S>]) => [
                k,
                removeMetadataFromCard(v as TamaroCard<unknown, S>),
              ]),
          ),
        );
        return { ...value, children, metadata: undefined } as TamaroCard<
          undefined,
          S
        >;
      }
      return { ...value, metadata: undefined } as TamaroCard<undefined, S>;
    }
    case 'constant_use':
    case 'literal':
      return { ...value, metadata: undefined } as TamaroCard<undefined, S>;
  }
}

function removeMetadataFromLocal<S extends State>(
  value: LocalDefinition<unknown, unknown, S>,
): LocalDefinition<undefined, undefined, S> {
  if ('root' in value) {
    return {
      ...value,
      root: removeMetadataFromCard(value.root as TamaroCard<unknown, S>),
      metadata: undefined,
    } as LocalDefinition<undefined, undefined, S>;
  }
  return { ...value, metadata: undefined } as LocalDefinition<
    undefined,
    undefined,
    S
  >;
}

export function create_tree(
  content: string,
): Omit<
  ProgramState<undefined, undefined, undefined, 'constructed'>,
  'imported_definitions'
> {
  const base_state = fromProgramToUnconstructedState(
    Array.from(getDefaultContext().values()),
    parse(content),
  );

  const state = construction_phase_constructor(base_state);

  return {
    expressions: state.expressions.map(removeMetadataFromCard),
    local_definitions: state.local_definitions.map(removeMetadataFromLocal),
  };
}
