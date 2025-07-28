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

export type FunctionDefinition<U, T, S extends State = State> =
  | LocalFunctionDefinition<U, S>
  | ImportedFunctionDefinition<T, S>;

export type ConstantDefinition<U, T, S extends State = State> =
  | LocalConstantDefinition<U, S>
  | ImportedConstantDefinition<T, S>;

export type LocalDefinition<U, S extends State = State> =
  | LocalConstantDefinition<U, S>
  | LocalFunctionDefinition<U, S>;

export type ImportedDefinition<T, S extends State = State> =
  | ImportedConstantDefinition<T, S>
  | ImportedFunctionDefinition<T, S>;

export type Definition<U, T, S extends State = State> =
  | FunctionDefinition<U, T, S>
  | ConstantDefinition<U, T, S>;

export type Definitions<U, T, S extends State = State> = Definition<U, T, S>[];

export type FunctionDefinitionCommon = Kind<'function_definition'> & {
  parameters: FunctionParameter[];
};

export type ConstantDefinitionCommon = Kind<'constant_definition'>;

export type LocalDefinitionStates<U> = TideAttachment<{
  unconstructed: {
    metadata: U;
  };
  constructed: {
    metadata: U;
    location: Location<false>;
    root?: TamaroCard<U, 'constructed'>;
  };
  syntax_checked: {
    metadata: U;
    location: Location<false>;
    dependencies: string[];
    root: TamaroCard<U, 'syntax_checked'>;
  };
  name_checked: {
    metadata: U;
    location: Location<false>;
    dependencies: Location[];
    root: TamaroCard<U, 'name_checked'>;
  };
  type_checked: {
    metadata: U;
    location: Location<false>;
    dependencies: Location[];
    type: ValueType;
    root: TamaroCard<U, 'type_checked'>;
  };
  code_created: {
    metadata: U;
    location: Location<false>;
    dependencies: Location[];
    type: ValueType;
    code: CodeRepresentation;
    root: TamaroCard<U, 'code_created'>;
  };
  evaluated: {
    metadata: U;
    location: Location<false>;
    dependencies: Location[];
    type: ValueType;
    code: CodeRepresentation;
    root: TamaroCard<U, 'evaluated'>;
  };
}>;

export type LocalDefinitionCommon<
  U,
  S extends State = State,
> = Subkind<'local'> & LocalDefinitionStates<U>[S];

export type LocalFunctionDefinition<
  U,
  S extends State = State,
> = FunctionDefinitionCommon & LocalDefinitionCommon<U, S>;

export type LocalConstantDefinition<
  U,
  S extends State = State,
> = ConstantDefinitionCommon & LocalDefinitionCommon<U, S>;

export type ImportedDefinitionStates<T> = TideAttachment<{
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
}>;

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
