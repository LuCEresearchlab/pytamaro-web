import { SoundType } from './typing';

// export type Expand<T> = T;
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyObject = {};

export interface Location<T extends string | false = string | false> {
  module: T;
  name: string;
}

export type Kind<U extends string> = { kind: U };
export type Subkind<U extends string> = { subkind: U };
export interface FunctionParameter {
  name: string;
  type: SoundType;
}
export type TamaroCardParameterEnvironment = FunctionParameter[];

export type UnionToIntersection<U> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never; // eslint-disable-next-line @typescript-eslint/no-empty-object-type

export type WrapNonObject<U> = U extends never
  ? EmptyObject
  : U extends object
    ? U
    : EmptyObject;
type _Merge<U extends object, V extends object> = Expand<
  U & {
    [k in keyof Omit<V, keyof U>]: V[k];
  }
>;
export type Merge<U, V> = _Merge<WrapNonObject<U>, WrapNonObject<V>>;
