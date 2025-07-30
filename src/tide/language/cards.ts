import {
  CodeRepresentation,
  FunctionParameter,
  Identity,
  Kind,
  Location,
} from './types';
import { State, TideAttachment } from './phases';
import { ValueType } from './typing';

export type TamaroCard<U, S extends State = State> =
  | TamaroCard_FunctionUse<U, S>
  | TamaroCard_ConstantUse<U, S>
  | TamaroCard_Literal<U, S>;

//
// CONSTANT USE
//
type BaseConstantUseStates<U> = {
  unconstructed: { metadata: U };
  constructed: { metadata: U; constant_name: string };
  syntax_checked: { metadata: U; constant_name: string };
  name_checked: { metadata: U; constant_name: string; location: Location };
  type_checked: {
    metadata: U;
    constant_name: string;
    location: Location;
    type: ValueType;
  };
  code_element: {
    metadata: U;
    constant_name: string;
    location: Location;
    type: ValueType;
    code: CodeRepresentation;
  };
  code_created: {
    metadata: U;
    constant_name: string;
    location: Location;
    type: ValueType;
    code: CodeRepresentation;
  };
  evaluated: {
    metadata: U;
    constant_name: string;
    location: Location;
    type: ValueType;
    code: CodeRepresentation;
    data: unknown;
  };
};

export type TamaroCard_ConstantUse_States<U> = Identity<
  TideAttachment<BaseConstantUseStates<U>>
>;

export type TamaroCard_ConstantUse<
  U,
  S extends State = State,
> = Kind<'constant_use'> & TamaroCard_ConstantUse_States<U>[S];

//
// LITERAL
//
type BaseLiteralStates<U> = {
  unconstructed: { metadata: U };
  constructed: { metadata: U; input: string };
  syntax_checked: { metadata: U; input: string; type: ValueType };
  name_checked: { metadata: U; input: string; type: ValueType };
  type_checked: { metadata: U; input: string; type: ValueType };
  code_element: {
    metadata: U;
    input: string;
    type: ValueType;
    code: CodeRepresentation;
  };
  code_created: {
    metadata: U;
    input: string;
    type: ValueType;
    code: CodeRepresentation;
  };
  evaluated: {
    metadata: U;
    input: string;
    type: ValueType;
    code: CodeRepresentation;
    data: unknown;
  };
};

export type TamaroCard_Literal_States<U> = Identity<
  TideAttachment<BaseLiteralStates<U>>
>;

export type TamaroCard_Literal<U, S extends State = State> = Kind<'literal'> &
  TamaroCard_Literal_States<U>[S];

//
// FUNCTION USE
//
type TamaroCardChildren<U, S extends State> = Map<string, TamaroCard<U, S>>;

type BaseFunctionUseStates<U> = {
  unconstructed: { metadata: U };
  constructed: {
    metadata: U;
    function_name: string;
    children: TamaroCardChildren<U, 'constructed'>;
  };
  syntax_checked: {
    metadata: U;
    function_name: string;
    children: TamaroCardChildren<U, 'syntax_checked'>;
  };
  name_checked: {
    metadata: U;
    location: Location;
    parameters: FunctionParameter[];
    children: TamaroCardChildren<U, 'name_checked'>;
  };
  type_checked: {
    metadata: U;
    type: ValueType;
    location: Location;
    parameters: FunctionParameter[];
    children: TamaroCardChildren<U, 'type_checked'>;
  };
  code_element: {
    metadata: U;
    type: ValueType;
    location: Location;
    parameters: FunctionParameter[];
    code: CodeRepresentation;
    children: TamaroCardChildren<U, 'code_element'>;
  };
  code_created: {
    metadata: U;
    type: ValueType;
    location: Location;
    parameters: FunctionParameter[];
    code: CodeRepresentation;
    children: TamaroCardChildren<U, 'code_element'>;
  };
  evaluated: {
    metadata: U;
    type: ValueType;
    location: Location;
    parameters: FunctionParameter[];
    code: CodeRepresentation;
    data: unknown;
    children: TamaroCardChildren<U, 'evaluated'>;
  };
};

export type TamaroCard_Functionuse_States<U> = Identity<
  TideAttachment<BaseFunctionUseStates<U>>
>;

export type TamaroCard_FunctionUse<
  U,
  S extends State = State,
> = Kind<'function_use'> & TamaroCard_Functionuse_States<U>[S];
