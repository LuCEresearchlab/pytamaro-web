import { TamaroCard, TamaroCardParameterEnvironment } from './cards';
import { Location, SoundType, Value, ValueType } from './expression';

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
> = IImportedFunctionDefintion<T> | IEvaluatedLocalFunctionDefinition<T, U>;

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

export type IFunctionDefinition<T extends TamaroCardParameterEnvironment> = {
  kind: 'function_definition';
  import: Location;
  evaluated: boolean;

  return_type: SoundType;
  parameters: T;
};

export type ILocalFunctionDefinition<
  T extends TamaroCardParameterEnvironment,
  U,
> = IFunctionDefinition<T> & {
  subkind: 'local';
  root: TamaroCard<T, U>;
  metadata: U;
};

export type IImportedFunctionDefintion<
  T extends TamaroCardParameterEnvironment,
> = IFunctionDefinition<T> & {
  subkind: 'imported';
  evaluated: true;

  dependencies: Location[];
};

export type IEvaluatedLocalFunctionDefinition<
  T extends TamaroCardParameterEnvironment,
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
  dependencies: Location[];
};

export type IEvaluatedLocalConstantDefinition<U> =
  ILocalConstantDefinition<U> & {
    evaluated: true;

    value: Value;
    dependencies: Location[];
  };

export function get_constant_type(v: EvaluatedConstantDefinition<unknown>) {
  switch (v.subkind) {
    case 'local':
      return v.value.type;
    case 'imported':
      return v.evaluated_type;
  }
}
