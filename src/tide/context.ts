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
  | IImportedFunctionDefintion<T>
  | IEvaluatedLocalFunctionDefinition<T, U>;

export type IFunctionDefinition<T extends FunctionParameter[]> = {
  kind: 'function_definition';
  import: Location;
  evaluated: boolean;

  return_type: SoundType;
  parameters: T;
};

export type ILocalFunctionDefinition<
  T extends FunctionParameter[],
  U,
> = IFunctionDefinition<T> & {
  subkind: 'local';
  root: TamaroCard<T, U>;
  metadata: U;
};

export type IImportedFunctionDefintion<T extends FunctionParameter[]> =
  IFunctionDefinition<T> & {
    subkind: 'imported';
    evaluated: true;

    dependencies: [];
  };

export type IEvaluatedLocalFunctionDefinition<
  T extends FunctionParameter[],
  U,
> = ILocalFunctionDefinition<T, U> & {
  evaluated: true;

  dependencies: Location[];
};

export type IConstantDefinition = {
  kind: 'constant_definition';
  import: Location;
  evaluated: boolean;
};

export type ILocalConstantDefinition<U> = IConstantDefinition & {
  import: Location;

  subkind: 'local';
  root?: TamaroCard<[], U>;
  metadata: U;
};

export type IImportedConstantDefinition = IConstantDefinition & {
  import: Location;

  subkind: 'imported';
  evaluated: true;

  evaluated_type: ValueType;
  dependencies: [];
};

export type IEvaluatedLocalConstantDefinition<U> =
  ILocalConstantDefinition<U> & {
    evaluated: true;

    value: Value;
    dependencies: Location[];
  };

export type LocalConstantDefinition<U> =
  | ILocalConstantDefinition<U>
  | IEvaluatedLocalConstantDefinition<U>;

export type ConstantDefinition<U> =
  | ILocalConstantDefinition<U>
  | EvaluatedConstantDefinition<U>;

export type EvaluatedConstantDefinition<U> =
  | IImportedConstantDefinition
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
