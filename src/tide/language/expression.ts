import { TideError } from './errors';
import { SoundType, UnsoundType } from './typing';

export type TideErrorValue = ErrorValue | ErrorPropagation;
export type Value = ExpressionValue | TideErrorValue;

export type ExpressionValue = GraphicExpressionValue | ColorExpressionValue;
export interface IExpressionValue {
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

export interface ErrorValue<T extends TideError = TideError> {
  type: UnsoundType.Bottom;
  error: T | T[];
}

export interface ErrorPropagation {
  type: UnsoundType.Bottom;
  error: false;
}
