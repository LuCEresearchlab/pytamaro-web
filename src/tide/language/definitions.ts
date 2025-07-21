import { TamaroCard } from './cards';
import {
  Kind,
  Located,
  Subkind,
  TamaroCardParameterEnvironment,
  Metadata,
  Dependencies,
} from './types';
import { Evaluated } from './types';
import { UnsoundType } from './typing';

export type Definition<U> =
  | FunctionDefinition<TamaroCardParameterEnvironment, U>
  | ConstantDefinition<U>;

export type EvaluatedDefinition<U> =
  | EvaluatedFunctionDefinition<TamaroCardParameterEnvironment, U>
  | EvaluatedConstantDefinition<U>;

export type FunctionDefinition<T extends TamaroCardParameterEnvironment, U> =
  | ILocalFunctionDefinition<T, U>
  | EvaluatedFunctionDefinition<T, U>;

export type EvaluatedFunctionDefinition<
  T extends TamaroCardParameterEnvironment,
  U,
> = IImportedFunctionDefinition<T> | IEvaluatedLocalFunctionDefinition<T, U>;

export type ConstantDefinition<U> =
  | ILocalConstantDefinition<U>
  | EvaluatedConstantDefinition<U>;

export type LocalConstantDefinition<U> =
  | ILocalConstantDefinition<U>
  | IEvaluatedLocalConstantDefinition<U>;

export type EvaluatedConstantDefinition<U> =
  | IImportedConstantDefinition
  | IEvaluatedLocalConstantDefinition<U>;

export type Definitions<U> = Definition<U>[];
export type EvaluatedDefinitions<U> = EvaluatedDefinition<U>[];

export type IFunctionDefinition<T extends TamaroCardParameterEnvironment> =
  Kind<'function_definition'> &
    Located<boolean> &
    Evaluated<boolean> & {
      parameters: T;
    };

export type ILocalFunctionDefinition<
  T extends TamaroCardParameterEnvironment,
  U,
> = IFunctionDefinition<T> &
  Located<false> &
  Subkind<'local'> &
  Evaluated<boolean, true, Dependencies> &
  Metadata<U> & {
    root: TamaroCard<T, U>;
  };

export type IImportedFunctionDefinition<
  T extends TamaroCardParameterEnvironment,
> = Subkind<'imported'> &
  IFunctionDefinition<T> &
  Located<true> &
  Evaluated<true, false>;

export const a: Evaluated<true, false> = {
  evaluated: true,
  evaluated_type: UnsoundType.Bottom,
};

export type IEvaluatedLocalFunctionDefinition<
  T extends TamaroCardParameterEnvironment,
  U,
> = Subkind<'local'> &
  ILocalFunctionDefinition<T, U> &
  Located<false> &
  Evaluated<true, true, Dependencies>;

export type IConstantDefinition = Located &
  Kind<'constant_definition'> & {
    evaluated: boolean;
  };

export type ILocalConstantDefinition<U> = Subkind<'local'> &
  IConstantDefinition &
  Located<false> &
  Metadata<U> &
  Evaluated<boolean, true, Dependencies> & {
    root?: TamaroCard<[], U>;
  };

export type IImportedConstantDefinition = IConstantDefinition &
  Located<true> &
  Subkind<'imported'> &
  Evaluated<true, false>;

export type IEvaluatedLocalConstantDefinition<U> = ILocalConstantDefinition<U> &
  Evaluated<true, true, Dependencies>;

export function get_definition_output_type(v: EvaluatedDefinition<unknown>) {
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
