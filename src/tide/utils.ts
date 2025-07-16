import {
  EvaluatedTamaroCard,
  TamaroCard,
  TamaroCardParameterEnvironment,
} from './cards';
import { UnsoundType, ValueType } from './expression';

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
    case 'parameter_use':
      return card.parameter.type;
  }
}
