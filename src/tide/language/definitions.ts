import { TamaroCard } from './cards';
import {
  Kind,
  Located,
  Subkind,
  Metadata,
  Dependencies,
  FunctionParameter,
  Expand,
} from './types';
import { Evaluated } from './types';
import { UnsoundType } from './typing';

export type FunctionDefinition<U, B extends boolean = boolean> =
  | LocalFunctionDefinition<U, B>
  | ImportedFunctionDefinition;

export type ConstantDefinition<U, B extends boolean = boolean> =
  | LocalConstantDefinition<U, B>
  | ImportedConstantDefinition;

export type LocalDefinition<U, B extends boolean = boolean> =
  | LocalConstantDefinition<U, B>
  | LocalFunctionDefinition<U, B>;

export type ImportedDefinition =
  | ImportedConstantDefinition
  | ImportedFunctionDefinition;

export type EvaluatedFunctionDefinition<U> = Expand<
  FunctionDefinition<U, true>
>;

export type EvaluatedConstantDefinition<U> = Expand<
  ConstantDefinition<U, true>
>;

export type EvaluatedLocalDefinition<U> = Expand<LocalDefinition<U, true>>;

export type EvaluatedImportedDefinition = Expand<ImportedDefinition>;

export type NonEvaluatedFunctionDefinition<U> = Expand<
  FunctionDefinition<U, false>
>;

export type NonEvaluatedConstantDefinition<U> = Expand<
  ConstantDefinition<U, false>
>;

export type NonEvaluatedLocalDefinition<U> = Expand<LocalDefinition<U, false>>;

export type NonEvaluatedImportedDefinition = Expand<ImportedDefinition>;

export type Definition<U> = FunctionDefinition<U> | ConstantDefinition<U>;

export type EvaluatedDefinition<U> =
  | EvaluatedFunctionDefinition<U>
  | EvaluatedConstantDefinition<U>;

export type Definitions<U> = Definition<U>[];
export type EvaluatedDefinitions<U> = EvaluatedDefinition<U>[];

export type FunctionDefinitionCommon = Kind<'function_definition'> & {
  parameters: FunctionParameter[];
};

export type ConstantDefinitionCommon = Kind<'constant_definition'>;

export type LocalDefinitionCommon<
  U,
  B extends boolean = boolean,
> = Located<false> &
  Evaluated<B, 'value', Dependencies> &
  Subkind<'local'> &
  Metadata<U> & {
    root?: TamaroCard<U>;
  };

export type ImportedDefinitionCommon = Located<true> &
  Subkind<'imported'> &
  Evaluated<true, 'type'>;

export type LocalFunctionDefinition<
  U,
  B extends boolean = boolean,
> = FunctionDefinitionCommon & LocalDefinitionCommon<U, B>;

export type LocalConstantDefinition<
  U,
  B extends boolean = boolean,
> = ConstantDefinitionCommon & LocalDefinitionCommon<U, B>;

export type ImportedFunctionDefinition = FunctionDefinitionCommon &
  ImportedDefinitionCommon;

export type ImportedConstantDefinition = ConstantDefinitionCommon &
  ImportedDefinitionCommon;

export function get_definition_output_type(v?: EvaluatedDefinition<unknown>) {
  if (!v) return UnsoundType.Bottom;
  switch (v.subkind) {
    case 'local':
      return v.value.type;
    case 'imported':
      return v.evaluated_type;
  }
}

export function get_definition_dependencies(v?: EvaluatedDefinition<unknown>) {
  if (!v) return [];
  switch (v.subkind) {
    case 'imported':
      return [];
    case 'local':
      return v.dependencies;
  }
}
