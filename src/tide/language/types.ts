import { Value } from './expression';
import { SoundType, ValueType } from './typing';

export interface Location {
  module: string | false;
  name: string;
}

export type Evaluated<
  evaluated extends boolean,
  hasvalue extends boolean = true,
  T = unknown,
> = evaluated extends true
  ? T & { evaluated: true } & (hasvalue extends true
        ? { value: Value }
        : { evaluated_type: ValueType })
  : { evaluated: false };

export type Dependencies = { dependencies: Location[] };
export type Located<imported extends boolean = boolean> = {
  location: Location & { module: imported extends true ? string : false };
};
export type Metadata<U> = { metadata: U };
export type Kind<U extends string> = { kind: U };
export type Subkind<U extends string> = { subkind: U };
export interface FunctionParameter {
  name: string;
  type: SoundType;
}
export type TamaroCardParameterEnvironment = FunctionParameter[];
