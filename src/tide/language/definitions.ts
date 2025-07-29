// Opaque utility
export type Opaque<T, Name extends string> = T & { readonly __brand?: Name };

// === IMPORTS ===
import { TamaroCard } from './cards';
import {
  Kind,
  Subkind,
  FunctionParameter,
  Location,
  CodeRepresentation,
} from './types';
import { State, TideAttachment } from './phases';
import { ValueType } from './typing';

// === DEFINITIONS ===

export type FunctionDefinition<U, Tlocal, Timport, S extends State = State> =
  | LocalFunctionDefinition<U, Tlocal, S>
  | ImportedFunctionDefinition<Timport, S>;

export type ConstantDefinition<U, Tlocal, Timport, S extends State = State> =
  | LocalConstantDefinition<U, Tlocal, S>
  | ImportedConstantDefinition<Timport, S>;

export type LocalDefinition<U, T, S extends State = State> =
  | LocalConstantDefinition<U, T, S>
  | LocalFunctionDefinition<U, T, S>;

export type ImportedDefinition<T, S extends State = State> =
  | ImportedConstantDefinition<T, S>
  | ImportedFunctionDefinition<T, S>;

export type Definition<U, Tlocal, Timport, S extends State = State> =
  | FunctionDefinition<U, Tlocal, Timport, S>
  | ConstantDefinition<U, Tlocal, Timport, S>;

export type Definitions<
  U,
  Tlocal,
  Timport,
  S extends State = State,
> = Definition<U, Tlocal, Timport, S>[];

// === COMMON TYPES ===

export type FunctionDefinitionCommon = Kind<'function_definition'> & {
  parameters: FunctionParameter[];
};

export type ConstantDefinitionCommon = Kind<'constant_definition'>;

// === LOCAL DEFINITION STATES ===

export type LocalDefinitionStates<U, T> = Opaque<
  TideAttachment<{
    unconstructed: {
      metadata: U;
    };
    constructed: {
      metadata: U;
      location: Location<false>;
      root?: TamaroCard<T, 'constructed'>;
    };
    syntax_checked: {
      metadata: U;
      location: Location<false>;
      dependencies: string[];
      root: TamaroCard<T, 'syntax_checked'>;
    };
    name_checked: {
      metadata: U;
      location: Location<false>;
      dependencies: Location[];
      root: TamaroCard<T, 'name_checked'>;
    };
    type_checked: {
      metadata: U;
      location: Location<false>;
      dependencies: Location[];
      type: ValueType;
      root: TamaroCard<T, 'type_checked'>;
    };
    code_created: {
      metadata: U;
      location: Location<false>;
      dependencies: Location[];
      type: ValueType;
      code: CodeRepresentation;
      root: TamaroCard<T, 'code_created'>;
    };
    evaluated: {
      metadata: U;
      location: Location<false>;
      dependencies: Location[];
      type: ValueType;
      code: CodeRepresentation;
      root: TamaroCard<T, 'evaluated'>;
    };
  }>,
  'LocalDefinitionStates'
>;

export type LocalDefinitionCommon<
  U,
  T,
  S extends State = State,
> = Subkind<'local'> & LocalDefinitionStates<T, U>[S];

export type LocalFunctionDefinition<
  U,
  T,
  S extends State = State,
> = FunctionDefinitionCommon & LocalDefinitionCommon<U, T, S>;

export type LocalConstantDefinition<
  U,
  T,
  S extends State = State,
> = ConstantDefinitionCommon & LocalDefinitionCommon<U, T, S>;

// === IMPORTED DEFINITION STATES ===

export type ImportedDefinitionStates<T> = Opaque<
  TideAttachment<{
    unconstructed: {
      metadata: T;
    };
    constructed: {
      metadata: T;
      location: Location<string>;
      type: ValueType;
    };
    syntax_checked: {
      metadata: T;
      location: Location<string>;
      type: ValueType;
    };
    name_checked: {
      metadata: T;
      location: Location<string>;
      type: ValueType;
    };
    type_checked: {
      metadata: T;
      location: Location<string>;
      type: ValueType;
    };
    code_created: {
      metadata: T;
      location: Location<string>;
      type: ValueType;
      code: CodeRepresentation & { definition: string };
    };
    evaluated: {
      metadata: T;
      location: Location<string>;
      type: ValueType;
      code: CodeRepresentation & { definition: string };
    };
  }>,
  'ImportedDefinitionStates'
>;

export type ImportedDefinitionCommon<
  T,
  S extends State = State,
> = Subkind<'imported'> & ImportedDefinitionStates<T>[S];

export type ImportedFunctionDefinition<
  T,
  S extends State = State,
> = FunctionDefinitionCommon & ImportedDefinitionCommon<T, S>;

export type ImportedConstantDefinition<
  T,
  S extends State = State,
> = ConstantDefinitionCommon & ImportedDefinitionCommon<T, S>;
