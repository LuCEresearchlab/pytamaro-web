import { Value } from './expression';
import { SoundType, ValueType } from './typing';

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type EmptyObject = object;

export interface Location<T extends string | false = string | false> {
  module: T;
  name: string;
}

export type EvaluationType = {
  value: { value: Value };
  type: { evaluated_type: ValueType };
  none: EmptyObject;
};

export type Evaluated<
  evaluated extends boolean,
  evaluation extends keyof EvaluationType = 'value',
  Ttrue = EmptyObject,
  Tfalse = EmptyObject,
> = {
  evaluated: evaluated;
} & (evaluated extends true ? Ttrue & EvaluationType[evaluation] : Tfalse);

export type Dependencies = { dependencies: Location[] };
export type Located<imported extends boolean = boolean> = {
  location: Location<imported extends true ? string : false>;
};
export type Metadata<U> = { metadata: U };
export type Kind<U extends string> = { kind: U };
export type Subkind<U extends string> = { subkind: U };
export interface FunctionParameter {
  name: string;
  type: SoundType;
}
export type TamaroCardParameterEnvironment = FunctionParameter[];
