import {
  Evaluated,
  Kind,
  Located,
  TamaroCardParameterEnvironment,
  Metadata,
} from './types';

export type ITamaroCard_ConstantUse<U> = Metadata<U> &
  Located &
  Kind<'constant_use'>;

export type ITamaroCard_Literal<U> = Metadata<U> &
  Kind<'literal'> & {
    str_value: string;
  };

export type ITamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
  U,
> = Metadata<U> &
  Kind<'function_use'> &
  Located & {
    children: Map<string, TamaroCard<T, U>>;
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

export type NonEvaluatedTamaroCard_ConstantUse<U> = Evaluated<false> &
  ITamaroCard_ConstantUse<U>;

export type NonEvaluatedTamaroCard_Literal<U> = Evaluated<false> &
  ITamaroCard_Literal<U>;

export type NonEvaluatedTamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
  U,
> = Evaluated<false> & ITamaroCard_FunctionUse<T, U>;

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

export type EvaluatedTamaroCard_ConstantUse<U> = Evaluated<true> &
  ITamaroCard_ConstantUse<U>;

export type EvaluatedTamaroCard_Literal<U> = Evaluated<true> &
  ITamaroCard_Literal<U>;

export type EvaluatedTamaroCard_FunctionUse<
  T extends TamaroCardParameterEnvironment,
  U,
> = Evaluated<true> &
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
