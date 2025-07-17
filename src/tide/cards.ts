import { Location, SoundType, UnsoundType, Value } from './expression';

export interface FunctionParameter {
  name: string;
  type: SoundType;
}

export type TamaroCardParameterEnvironment = FunctionParameter[];

export type ITamaroCard_ConstantUse<U> = {
  kind: 'constant_use';
  import: Location;
  metadata: U;
};

export type ITamaroCard_Literal<U> = {
  kind: 'literal';
  str_value: string;
  type: SoundType.Float | SoundType.Str | SoundType.Bool | UnsoundType.Bottom;
  metadata: U;
};

export type ITamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
  U,
> = {
  kind: 'function_use';
  import: Location;
  children: Map<string, TamaroCard<T, U>>;
  metadata: U;
};
// export type ITamaroCard_ParameterUse<
//   T extends TamaroCardParameterEnvironment,
//   U,
// > = {
//   kind: 'parameter_use';
//   parameter: T[number];
//   metadata: U;
// };

export type INonEvaluated = { evaluated: false };

export type NonEvaluatedTamaroCard_ConstantUse<U> = INonEvaluated &
  ITamaroCard_ConstantUse<U>;

export type NonEvaluatedTamaroCard_Literal<U> = INonEvaluated &
  ITamaroCard_Literal<U>;

export type NonEvaluatedTamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
  U,
> = INonEvaluated & ITamaroCard_FunctionUse<T, U>;

// export type NonEvaluatedTamaroCard_ParameterUse<
//   T extends TamaroCardParameterEnvironment,
//   U,
// > = INonEvaluated & ITamaroCard_ParameterUse<T, U>;

export type NonEvaluatedTamaroCard<
  T extends TamaroCardParameterEnvironment,
  U,
> =
  | NonEvaluatedTamaroCard_ConstantUse<U>
  | NonEvaluatedTamaroCard_Literal<U>
  | NonEvaluatedTamaroCard_FunctionUse<T, U>;
// | NonEvaluatedTamaroCard_ParameterUse<T, U>;

export type IEvaluated = { value: Value; evaluated: true };

export type EvaluatedTamaroCard_ConstantUse<U> = IEvaluated &
  ITamaroCard_ConstantUse<U>;

export type EvaluatedTamaroCard_Literal<U> = IEvaluated &
  ITamaroCard_Literal<U>;

export type EvaluatedTamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
  U,
> = IEvaluated &
  ITamaroCard_FunctionUse<T, U> & {
    children: Map<string, EvaluatedTamaroCard<T, U>>;
  };

// export type EvaluatedTamaroCard_ParameterUse<
//   T extends TamaroCardParameterEnvironment,
//   U,
// > = IEvaluated & ITamaroCard_ParameterUse<T, U>;

export type EvaluatedTamaroCard<T extends TamaroCardParameterEnvironment, U> =
  | EvaluatedTamaroCard_ConstantUse<U>
  | EvaluatedTamaroCard_Literal<U>
  | EvaluatedTamaroCard_FunctionUse<T, U>;
// | EvaluatedTamaroCard_ParameterUse<T, U>;

export type TamaroCard<T extends TamaroCardParameterEnvironment, U> =
  | TamaroCard_ConstantUse<U>
  | TamaroCard_Literal<U>
  | TamaroCard_FunctionUse<T, U>;
// | TamaroCard_ParameterUse<T, U>;

export type TamaroCard_ConstantUse<U> =
  | NonEvaluatedTamaroCard_ConstantUse<U>
  | EvaluatedTamaroCard_ConstantUse<U>;

export type TamaroCard_Literal<U> =
  | NonEvaluatedTamaroCard_Literal<U>
  | EvaluatedTamaroCard_Literal<U>;

export type TamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
  U,
> =
  | NonEvaluatedTamaroCard_FunctionUse<T, U>
  | EvaluatedTamaroCard_FunctionUse<T, U>;

// export type TamaroCard_ParameterUse<
//   T extends TamaroCardParameterEnvironment,
//   U,
// > =
//   | NonEvaluatedTamaroCard_ParameterUse<T, U>
//   | EvaluatedTamaroCard_ParameterUse<T, U>;
