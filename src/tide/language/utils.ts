import {
  EvaluatedTamaroCard,
  ITamaroCard_ConstantUse,
  ITamaroCard_FunctionUse,
  ITamaroCard_Literal,
  TamaroCard,
} from './cards';
import { TamaroCardParameterEnvironment } from './types';
import { Value } from './expression';
import { Location } from './types';
import { LiteralType, SoundType, UnsoundType, ValueType } from './typing';

export const BOOL_REGEX = /(True)|(False)/;
export const INT_REGEX = /^-?[0-9]+$/g;
export const FLOAT_REGEX = /^-?[0-9]+(\.[0-9]*)?$/g;
export const STR_REGEX = /^"([^\\"]|(\\")|\\\\)*"$/g;

export function inferRawValueType(v: string): LiteralType {
  if (v.match(BOOL_REGEX)) return SoundType.Bool;
  if (v.match(STR_REGEX)) return SoundType.Str;
  if (v.match(INT_REGEX)) return SoundType.Int;
  if (v.match(FLOAT_REGEX)) return SoundType.Float;
  return UnsoundType.Bottom;
}

export function getCardAsEvaluated<
  U extends TamaroCardParameterEnvironment,
  T,
  B extends true,
>(card: TamaroCard<U, T> & { evaluated: B }) {
  return card as EvaluatedTamaroCard<U, T>;
}

export function getCardOutputType<U extends TamaroCardParameterEnvironment, T>(
  card: TamaroCard<U, T>,
): ValueType {
  switch (card.kind) {
    case 'constant_use':
      return card.evaluated ? card.value.type : UnsoundType.Bottom;
    case 'literal':
      return card.evaluated ? card.value.type : UnsoundType.Bottom;
    case 'function_use':
      return card.evaluated ? card.value.type : UnsoundType.Bottom;
  }
}

export function toFlat<U extends TamaroCardParameterEnvironment, T>(
  card: TamaroCard<U, T>,
): TamaroCard<U, T>[] {
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
export function eqCard<T extends TamaroCardParameterEnvironment, U>(
  a: TamaroCard<T, U>,
  _b: TamaroCard<T, U>,
): boolean {
  if (a.kind !== _b.kind) return false;
  if (a.evaluated !== _b.evaluated) return false;

  switch (a.kind) {
    case 'constant_use': {
      const b = _b as ITamaroCard_ConstantUse<U>;
      return eqLocation(a.location, b.location);
    }

    case 'literal': {
      const b = _b as ITamaroCard_Literal<U>;

      return b.str_value === a.str_value;
    }
    case 'function_use': {
      const b = _b as ITamaroCard_FunctionUse<T, U>;
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
