import { CodeRepresentation } from './code';
import { TideError } from './errors';
import { SoundType, ValueType, UnsoundType } from './typing';

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

export interface ErrorValue<T extends TideError = TideError> {
  type: UnsoundType.Bottom;
  error: T | T[];
}

export interface ErrorPropagation {
  type: UnsoundType.Bottom;
  error: false;
}
