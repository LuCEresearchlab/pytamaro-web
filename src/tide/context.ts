import { FunctionParameter, TamaroCard } from './cards';
import { ValueType, Location, Value } from './expression';

export type Definition =
  | FunctionDefinition<FunctionParameter[]>
  | ConstantDefinition;
export type EvaluatedDefinition =
  | EvaluatedFunctionDefinition<FunctionParameter[]>
  | EvaluatedConstantDefinition;

export type FunctionDefinition<T extends FunctionParameter[]> =
  | ILocalFunctionDefinition<T>
  | EvaluatedFunctionDefinition<T>;

export type EvaluatedFunctionDefinition<T extends FunctionParameter[]> =
  | IImportedFunctionDefintion<T>
  | IEvaluatedLocalFunctionDefinition<T>;

export interface IFunctionDefinition<T extends FunctionParameter[]> {
  kind: 'function_definition';
  import: Location;
  evaluated: boolean;

  parameters: T;
}

export interface ILocalFunctionDefinition<T extends FunctionParameter[]>
  extends IFunctionDefinition<T> {
  subkind: 'local';
  root: TamaroCard<T>;
}

export interface IImportedFunctionDefintion<T extends FunctionParameter[]>
  extends IFunctionDefinition<T> {
  subkind: 'imported';
  evaluated: true;

  evaluated_type: ValueType;
  dependencies: [];
}

export interface IEvaluatedLocalFunctionDefinition<
  T extends FunctionParameter[],
> extends ILocalFunctionDefinition<T> {
  evaluated: true;

  evaluated_type: ValueType;
  dependencies: Location[];
}

export interface IConstantDefinition {
  kind: 'constant_definition';
  import: Location;
  evaluated: boolean;
}

export interface ILocalConstantDefinition extends IConstantDefinition {
  import: Location;

  subkind: 'local';
  root?: TamaroCard<[]>;
}

export interface IImportedConstantDefinition extends IConstantDefinition {
  import: Location;

  subkind: 'imported';
  evaluated: true;

  evaluated_type: ValueType;
  dependencies: [];
}

export interface IEvaluatedLocalConstantDefinition
  extends ILocalConstantDefinition {
  evaluated: true;

  value: Value;
  evaluated_type: ValueType;
  dependencies: Location[];
}

export type ConstantDefinition =
  | ILocalConstantDefinition
  | EvaluatedConstantDefinition;

export type EvaluatedConstantDefinition =
  | IImportedConstantDefinition
  | IEvaluatedLocalConstantDefinition;

export type Context = Definition[];
export type EvaluatedContext = Map<Location, EvaluatedDefinition>;
