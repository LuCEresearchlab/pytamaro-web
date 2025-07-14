import { Location, SoundType, UnsoundType } from './expression';

export interface FunctionParameter {
  name: string;
  type: SoundType;
}

export type TamaroCardParameterEnvironment = FunctionParameter[];

export type TamaroCard<T extends TamaroCardParameterEnvironment> =
  | TamaroCard_ConstantUse
  | TamaroCard_Literal
  | TamaroCard_FunctionUse<T>
  | TamaroCard_ParameterUse<T>;

export interface TamaroCard_ConstantUse {
  kind: 'constant_use';
  import: Location;
}

export interface TamaroCard_Literal {
  kind: 'literal';
  value: string;
  type: SoundType.Float | SoundType.Str | SoundType.Bool | UnsoundType.Bottom;
}

export interface TamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
> {
  kind: 'function_use';
  import: Location;
  children: Map<string, TamaroCard<T>>;
}

export interface TamaroCard_ParameterUse<
  T extends TamaroCardParameterEnvironment,
> {
  kind: 'parameter_use';
  parameter: T[number];
}
