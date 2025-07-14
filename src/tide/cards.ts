import { Location, SoundType, UnsoundType, Value } from './expression';

export interface FunctionParameter {
  name: string;
  type: SoundType;
}

export type TamaroCardParameterEnvironment = FunctionParameter[];

export type TamaroCard<T extends TamaroCardParameterEnvironment, U> =
  | TamaroCard_ConstantUse<U>
  | TamaroCard_Literal<U>
  | TamaroCard_FunctionUse<T, U>
  | TamaroCard_ParameterUse<T, U>;

export interface TamaroCard_ConstantUse<U> {
  kind: 'constant_use';
  import: Location;
  metadata: U;
}

export interface TamaroCard_Literal<U> {
  kind: 'literal';
  str_value: string;
  type: SoundType.Float | SoundType.Str | SoundType.Bool | UnsoundType.Bottom;
  metadata: U;
}

export interface TamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
  U,
> {
  kind: 'function_use';
  import: Location;
  children: Map<string, TamaroCard<T, U>>;
  metadata: U;
}

export interface TamaroCard_ParameterUse<
  T extends TamaroCardParameterEnvironment,
  U,
> {
  kind: 'parameter_use';
  parameter: T[number];
  metadata: U;
}

export type EvaluatedTamaroCard<T extends TamaroCardParameterEnvironment, U> =
  | EvaluatedTamaroCard_ConstantUse<U>
  | EvaluatedTamaroCard_Literal<U>
  | EvaluatedTamaroCard_FunctionUse<T, U>
  | EvaluatedTamaroCard_ParameterUse<T, U>;

export interface EvaluatedTamaroCard_ConstantUse<U>
  extends TamaroCard_ConstantUse<U> {
  value: Value;
}
export interface EvaluatedTamaroCard_Literal<U> extends TamaroCard_Literal<U> {
  value: Value;
}
export interface EvaluatedTamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
  U,
> extends TamaroCard_FunctionUse<T, U> {
  children: Map<string, EvaluatedTamaroCard<T, U>>;
  value: Value;
}

export interface EvaluatedTamaroCard_ParameterUse<
  T extends TamaroCardParameterEnvironment,
  U,
> extends TamaroCard_ParameterUse<T, U> {
  value: Value;
}
