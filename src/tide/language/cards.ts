import { Evaluated, Expand, Kind, Located, Metadata } from './types';

export type TamaroCard_ConstantUse<
  U,
  B extends boolean = boolean,
> = Kind<'constant_use'> & Evaluated<B> & Located & Metadata<U>;

export type TamaroCard_Literal<
  U,
  B extends boolean = boolean,
> = Kind<'literal'> &
  Metadata<U> & {
    str_value: string;
  } & Evaluated<B>;

export type TamaroCard_FunctionUse<
  U,
  B extends boolean = boolean,
> = Kind<'function_use'> &
  Located<boolean> &
  Metadata<U> &
  Evaluated<
    B,
    'value',
    {
      children: Map<string, EvaluatedTamaroCard<U>>;
    },
    {
      children: Map<string, TamaroCard<U>>;
    }
  >;

export type EvaluatedTamaroCard_ConstantUse<U> = Expand<
  TamaroCard_ConstantUse<U, true>
>;

export type EvaluatedTamaroCard_Literal<U> = Expand<
  TamaroCard_Literal<U, true>
>;

export type EvaluatedTamaroCard_FunctionUse<U> = Expand<
  TamaroCard_FunctionUse<U, true>
>;

export type NonEvaluatedTamaroCard_ConstantUse<U> = Expand<
  TamaroCard_ConstantUse<U, false>
>;

export type NonEvaluatedTamaroCard_Literal<U> = Expand<
  TamaroCard_Literal<U, false>
>;

export type NonEvaluatedTamaroCard_FunctionUse<U> = Expand<
  TamaroCard_FunctionUse<U, false>
>;

export type NonEvaluatedTamaroCard<U> =
  | NonEvaluatedTamaroCard_ConstantUse<U>
  | NonEvaluatedTamaroCard_Literal<U>
  | NonEvaluatedTamaroCard_FunctionUse<U>;

export type EvaluatedTamaroCard<U> =
  | EvaluatedTamaroCard_ConstantUse<U>
  | EvaluatedTamaroCard_Literal<U>
  | EvaluatedTamaroCard_FunctionUse<U>;

export type TamaroCard<U> = NonEvaluatedTamaroCard<U> | EvaluatedTamaroCard<U>;
