import { FunctionParameter, TamaroCard } from './cards';
import { ValueType, Location, Value, SoundType } from './expression';

export type Definition<U> =
  | FunctionDefinition<FunctionParameter[], U>
  | ConstantDefinition<U>;

export type EvaluatedDefinition<U> =
  | EvaluatedFunctionDefinition<FunctionParameter[], U>
  | EvaluatedConstantDefinition<U>;

export type FunctionDefinition<T extends FunctionParameter[], U> =
  | ILocalFunctionDefinition<T, U>
  | EvaluatedFunctionDefinition<T, U>;

export type EvaluatedFunctionDefinition<T extends FunctionParameter[], U> =
  | IImportedFunctionDefintion<T, U>
  | IEvaluatedLocalFunctionDefinition<T, U>;

export interface IFunctionDefinition<T extends FunctionParameter[]> {
  kind: 'function_definition';
  import: Location;
  evaluated: boolean;

  return_type: SoundType;
  parameters: T;
}

export interface ILocalFunctionDefinition<T extends FunctionParameter[], U>
  extends IFunctionDefinition<T> {
  subkind: 'local';
  root: TamaroCard<T, U>;
}

export interface IImportedFunctionDefintion<T extends FunctionParameter[], U>
  extends IFunctionDefinition<T> {
  subkind: 'imported';
  evaluated: true;

  dependencies: [];
  metadata: U;
}

export interface IEvaluatedLocalFunctionDefinition<
  T extends FunctionParameter[],
  U,
> extends ILocalFunctionDefinition<T, U> {
  evaluated: true;

  dependencies: Location[];
}

export interface IConstantDefinition {
  kind: 'constant_definition';
  import: Location;
  evaluated: boolean;
}

export interface ILocalConstantDefinition<U> extends IConstantDefinition {
  import: Location;

  subkind: 'local';
  root?: TamaroCard<[], U>;
}

export interface IImportedConstantDefinition<U> extends IConstantDefinition {
  import: Location;

  subkind: 'imported';
  evaluated: true;

  evaluated_type: ValueType;
  dependencies: [];
  metadata: U;
}

export interface IEvaluatedLocalConstantDefinition<U>
  extends ILocalConstantDefinition<U> {
  evaluated: true;

  value: Value;
  dependencies: Location[];
}

export type ConstantDefinition<U> =
  | ILocalConstantDefinition<U>
  | EvaluatedConstantDefinition<U>;

export type EvaluatedConstantDefinition<U> =
  | IImportedConstantDefinition<U>
  | IEvaluatedLocalConstantDefinition<U>;

export type Context<U> = Definition<U>[];
export type EvaluatedContext<U> = EvaluatedDefinition<U>[];

export function get_constant_type(v: EvaluatedConstantDefinition<unknown>) {
  switch (v.subkind) {
    case 'local':
      return v.value.type;
    case 'imported':
      return v.evaluated_type;
  }
}
