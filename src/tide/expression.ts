export interface Location {
  module: string | false;
  name: string;
}

export interface CodeRepresentation {
  expression: string;
  imports: Location[];
}

export type Value = ExpressionValue | ErrorValue;

export interface ExpressionValue {
  value: CodeRepresentation;
  type: SoundType;
}

export interface ErrorValue {
  type: UnsoundType.Bottom;
}

export type ValueType = SoundType | UnsoundType;

export enum SoundType {
  Float,
  Str,
  Bool,
  Color,
  Graphic,
  Point,
}

export enum UnsoundType {
  Bottom = -1,
}

export function type_equality_rule(a: ValueType, b: ValueType) {
  return a === b && a != UnsoundType.Bottom;
}
