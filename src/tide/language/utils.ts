import {
  TamaroCard_ConstantUse,
  TamaroCard_FunctionUse,
  TamaroCard_Literal,
  TamaroCard,
} from './cards';
import { Value } from './expression';
import { Location } from './types';

export function toFlat<T>(card: TamaroCard<T>): TamaroCard<T>[] {
  switch (card.kind) {
    case 'literal':
    case 'constant_use':
      return [card];
    case 'function_use':
      return Array.from(card.children.values())
        .map(toFlat)
        .reduce((a, b) => a.concat(b), [card]);
  }
}

export function eqLocation(a: Location, b: Location) {
  return compareLocation(a, b) === 0;
}

export function eqValue(a: Value, b: Value) {
  if (a.type !== b.type) return false;

  return JSON.stringify(a) === JSON.stringify(b);
}

// This equality is not perfect because we should not need more than that
export function eqCard<U>(a: TamaroCard<U>, _b: TamaroCard<U>): boolean {
  if (a.kind !== _b.kind) return false;
  if (a.evaluated !== _b.evaluated) return false;

  switch (a.kind) {
    case 'constant_use': {
      const b = _b as TamaroCard_ConstantUse<U>;
      return eqLocation(a.location, b.location);
    }

    case 'literal': {
      const b = _b as TamaroCard_Literal<U>;

      return b.str_value === a.str_value;
    }
    case 'function_use': {
      const b = _b as TamaroCard_FunctionUse<U>;
      if (!eqLocation(a.location, b.location)) return false;

      return (
        a.children.size === b.children.size &&
        Array.from(a.children.keys()).find((v) => !b.children.has(v)) ===
          undefined &&
        a.children
          .entries()
          .find(([k, v]) => !eqCard(v, b.children.get(k)!)) === undefined
      );
    }
  }
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
