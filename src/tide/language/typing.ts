import { TideError, TideRuntimeError } from './errors';

export type ValueType = SoundType | ErrorType | false;

export type LiteralType =
  | SoundType.Int
  | SoundType.Float
  | SoundType.Str
  | SoundType.Bool
  | UnsoundType;

export enum SoundType {
  Int,
  Float,
  Str,
  Bool,
  Color,
  Graphic,
  Point,
}

export type ErrorType<
  T extends Exclude<TideError, TideRuntimeError> = Exclude<
    TideError,
    TideRuntimeError
  >,
> = { error: T | T[] };

export function type_toString(type: SoundType) {
  switch (type) {
    case SoundType.Int:
      return 'int';
    case SoundType.Float:
      return 'float';
    case SoundType.Str:
      return 'str';
    case SoundType.Bool:
      return 'bool';
    case SoundType.Color:
      return 'Color';
    case SoundType.Graphic:
      return 'Graphic';
    case SoundType.Point:
      return 'Point';
  }
}

export enum UnsoundType {
  Bottom = -1,
}

export function type_equality_rule(a: ValueType, b: ValueType) {
  return (
    a != UnsoundType.Bottom &&
    b != UnsoundType.Bottom &&
    (a === b || convert_type(a, b) || convert_type(b, a))
  );
}

export function convert_type(a: ValueType, b: ValueType) {
  return a === SoundType.Int && b === SoundType.Float;
}
