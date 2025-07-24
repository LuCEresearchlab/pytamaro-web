import { CodeRepresentation } from '../../../components/tide/cards';
import { TamaroCard } from './cards';
import { Kind, Subkind, FunctionParameter, Location, Expand } from './types';
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

export type Definition<U, S extends State = State> =
  | FunctionDefinition<U, S>
  | ConstantDefinition<U, S>;
export type Definitions<U, S extends State = State> = Definition<U, S>[];

export type FunctionDefinitionCommon = Kind<'function_definition'> & {
  parameters: FunctionParameter[];
};

export type ConstantDefinitionCommon = Kind<'constant_definition'>;

export type LocalDefinitionStates<U> = TideAttachment<{
  unconstructed: {
    metadata: U;
  };
  constructed: {
    name: string;
    root?: TamaroCard<U, 'constructed'>;
  };
  syntax_checked: {
    dependencies: Location[];
    root: TamaroCard<U, 'syntax_checked'>;
  };
  name_checked: {
    location: Location<false>;
    root: TamaroCard<U, 'name_checked'>;
  };
  type_checked: {
    type: ValueType;
    root: TamaroCard<U, 'type_checked'>;
  };
  code_created: {
    code: CodeRepresentation;
    root: TamaroCard<U, 'code_created'>;
  };
  evaluated: {
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
    name: string;
  };
  name_checked: {
    location: Location<string>;
  };
  type_checked: {
    type: ValueType;
  };
}>;

export type ImportedDefinitionCommon<T, S extends State = State> = Expand<
  Subkind<'imported'> & ImportedDefinitionStates<T>[S]
>;

export type ImportedFunctionDefinition<T, S extends State = State> = Expand<
  FunctionDefinitionCommon & ImportedDefinitionCommon<T, S>
>;

export type ImportedConstantDefinition<T, S extends State = State> = Expand<
  ConstantDefinitionCommon & ImportedDefinitionCommon<T, S>
>;
