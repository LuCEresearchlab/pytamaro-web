import { TamaroCard } from './cards';
import { Definition } from './definitions';
import { TideRuntimeError } from './errors';
import { State } from './phases';
import { Location } from './types';
import { ErrorType } from './typing';

export function toFlat<T>(card: TamaroCard<T>): TamaroCard<T>[] {
  switch (card.kind) {
    case 'literal':
    case 'constant_use':
      return [card];
    case 'function_use':
      if ('children' in card) {
        const children = card.children;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const values = Array.from(children.values() as any) as TamaroCard<T>[];
        return values.map(toFlat).reduce((a, b) => a.concat(b), [card]);
      } else return [card];
  }
}

// Definitions are identified by module and name together
export function locationKey(location: Location) {
  return `${String(location.module)}:${location.name}`;
}

export function eqLocation(a: Location, b: Location) {
  return compareLocation(a, b) === 0;
}

export function compareLocation(a: Location, b: Location) {
  if (a.module === b.module) {
    return a.name.localeCompare(b.name);
  }
  if (a.module === false) {
    return 1;
  }
  return -1;
}

export function extract_error(
  value:
    | TamaroCard<unknown, State>
    | Definition<unknown, unknown, unknown, State>
    | undefined,
): ErrorType | { error: TideRuntimeError } | false | undefined {
  if (!value) return undefined;

  if ('error_phase' in value) {
    if (value.error_phase === 'evaluated') {
      return value.value === false ? false : { error: value.value };
    }
    return value.type;
  }
  return undefined;
}
