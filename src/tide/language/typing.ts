import { TideError, TideRuntimeError } from './errors';

export type ValueType = SoundType | ErrorType | false | UnsoundType;

export type LiteralType =
  | SoundType.Int
  | SoundType.Float
  | SoundType.Str
  | SoundType.Bool;

export enum SoundType {
  Int,
  Float,
  Str,
  Bool,
  Color,
  Graphic,
  Point,
}

export type EvaluatedValueType = {
  [k in SoundType]: k extends SoundType.Graphic
    ? string
    : k extends SoundType.Color
      ? { red: number; green: number; blue: number; alpha: number }
      : k extends
            | SoundType.Int
            | SoundType.Float
            | SoundType.Str
            | SoundType.Bool
        ? { repr: string }
        : undefined;
};

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
    a !== false &&
    b != UnsoundType.Bottom &&
    b !== false &&
    typeof a === 'number' &&
    typeof b === 'number' &&
    (a === b || convert_type(a, b) || convert_type(b, a))
  );
}

export function convert_type(a: ValueType, b: ValueType) {
  return a === SoundType.Int && b === SoundType.Float;
}
