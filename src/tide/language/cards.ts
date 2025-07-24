import { CodeRepresentation } from '../../../components/tide/cards';
import { Kind, Location } from './types';
import { State, TideAttachment } from './phases';
import { ValueType } from './typing';

export type TamaroCard<U, S extends State = State> =
  | TamaroCard_FunctionUse<U, S>
  | TamaroCard_ConstantUse<U, S>
  | TamaroCard_Literal<U, S>;

export type TamaroCard_ConstantUse_States<U> = TideAttachment<{
  unconstructed: {
    metadata: U;
  };
  constructed: {
    input: string;
  };
  name: {
    location: Location;
  };
  type_checked: {
    type: ValueType;
  };
  code_created: {
    code_created: CodeRepresentation;
  };
  evaluated: {
    data: unknown;
  };
}>;

export type TamaroCard_ConstantUse<
  U,
  S extends State = State,
> = Kind<'constant_use'> & TamaroCard_ConstantUse_States<U>[S];

export type TamaroCard_Literal_States<U> = TideAttachment<{
  unconstructed: {
    metadata: U;
  };
  constructed: {
    input: string;
  };
  type_checked: {
    type: ValueType;
  };
  code_created: {
    code_created: CodeRepresentation;
  };
  evaluated: {
    data: unknown;
  };
}>;

export type TamaroCard_Literal<U, S extends State = State> = Kind<'literal'> &
  TamaroCard_Literal_States<U>[S];

type TamaroCardChildren<U, S extends State> = Map<string, TamaroCard<U, S>>;

export type TamaroCard_Functionuse_States<U> = TideAttachment<{
  unconstructed: {
    metadata: U;
  };
  constructed: {
    function_name: string;
    children: TamaroCardChildren<U, 'constructed'>;
  };
  syntax_checked: {
    children: TamaroCardChildren<U, 'syntax_checked'>;
  };
  name_checked: {
    location: Location;
    children: TamaroCardChildren<U, 'name_checked'>;
  };
  type_checked: {
    type: ValueType;
    params: Map<string, ValueType>;
    children: TamaroCardChildren<U, 'type_checked'>;
  };
  code_created: {
    code_created: CodeRepresentation;
    children: TamaroCardChildren<U, 'code_created'>;
  };
  evaluated: {
    data: unknown;
    children: TamaroCardChildren<U, 'evaluated'>;
  };
}>;

export type TamaroCard_FunctionUse<
  U,
  S extends State = State,
> = Kind<'function_use'> & TamaroCard_Functionuse_States<U>[S];
