import { EvaluatedTamaroCard, TamaroCardParameterEnvironment } from './cards';
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

export type Value = IExpressionValue | ErrorValue | ErrorPropagation;
export interface IExpressionValue {
  value: CodeRepresentation;
  type: SoundType;
}
export interface ErrorValue {
  type: UnsoundType.Bottom;
  error: TideError | TideError[];
  children?: EvaluatedTamaroCard<TamaroCardParameterEnvironment, unknown>[];
}

export interface ErrorPropagation {
  type: UnsoundType.Bottom;
  error: false;
  children?: EvaluatedTamaroCard<TamaroCardParameterEnvironment, unknown>[];
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

export function type_toString(type: SoundType) {
  switch (type) {
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
  return a === b && a != UnsoundType.Bottom;
}
