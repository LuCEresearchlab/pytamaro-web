import {
  EvaluatedTamaroCard,
  TamaroCard,
  TamaroCardParameterEnvironment,
} from './cards';
import {
  compareLocation,
  Location,
  UnsoundType,
  ValueType,
} from './expression';

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
      return Array.from(card.children.values()).concat(card);
  }
}

export function eqLocation(a: Location, b: Location) {
  return compareLocation(a, b) === 0;
}
