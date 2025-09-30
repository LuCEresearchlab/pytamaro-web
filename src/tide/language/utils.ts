import { TamaroCard } from './cards';
import { Location } from './types';

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
