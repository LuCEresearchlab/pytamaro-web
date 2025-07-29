import { SoundType } from './typing';

export type Identity<T> = { [K in keyof T]: T[K] } & {};
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyObject = {};

export interface Location<T extends string | false = string | false> {
  module: T;
  name: string;
}

export type Kind<U extends string> = { kind: U };
export type Subkind<U extends string> = { subkind: U };
export type Metadata<U> = { metadata: U };
export interface FunctionParameter {
  name: string;
  type: SoundType;
}
export type TamaroCardParameterEnvironment = FunctionParameter[];

export type CodeRepresentation =
  | {
      expression: string;
      imports: Location[];
    }
  | {
      definition: string;
      location: Location;
      imports: Location[];
    };
