import { TideError } from './errors';

export interface Location {
  module: string | false;
  name: string;
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

export interface CodeRepresentation {
  expression: string;
  imports: Location[];
}

export type TideErrorValue = ErrorValue | ErrorPropagation;
export type Value = ExpressionValue | TideErrorValue;

export type ExpressionValue =
  | GraphicExpressionValue
  | ColorExpressionValue
  | OtherExpressionValue;
export interface IExpressionValue {
  value: CodeRepresentation;
  type: SoundType;
}

export interface GraphicExpressionValue extends IExpressionValue {
  type: SoundType.Graphic;
  data?: string;
}

export interface ColorExpressionValue extends IExpressionValue {
  type: SoundType.Color;
  data?: { red: number; green: number; blue: number; alpha: number };
}

export interface OtherExpressionValue extends IExpressionValue {
  type: Exclude<ValueType, UnsoundType.Bottom>;
  data: undefined;
}

export interface ErrorValue {
  type: UnsoundType.Bottom;
  error: TideError | TideError[];
}

export interface ErrorPropagation {
  type: UnsoundType.Bottom;
  error: false;
}

export type ValueType = SoundType | UnsoundType;

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
