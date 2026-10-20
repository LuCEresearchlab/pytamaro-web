import {
  CodeRepresentation,
  FunctionParameter,
  Identity,
  Kind,
  Location,
} from './types';
import { AttachmentIntersection, State, TideAttachment } from './phases';
import { LiteralType, ValueType } from './typing';

export type TamaroCard<U, S extends State = State> =
  | TamaroCard_FunctionUse<U, S>
  | TamaroCard_ConstantUse<U, S>
  | TamaroCard_Literal<U, S>;

//
// CONSTANT USE
//
type BaseConstantUseStates<U> = {
  unconstructed: { metadata: U };
  constructed: { metadata: U; constant_name: string; module?: string };
  syntax_checked: { metadata: U; constant_name: string; module?: string };
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
    code_element: CodeRepresentation;
  };
  code_created: {
    metadata: U;
    constant_name: string;
    location: Location;
    type: ValueType;
    code_element: CodeRepresentation;
    code: string;
  };
  evaluated: {
    metadata: U;
    constant_name: string;
    location: Location;
    type: ValueType;
    code_element: CodeRepresentation;
    code: string;
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
  syntax_checked: { metadata: U; input: string; type: LiteralType };
  name_checked: { metadata: U; input: string; type: LiteralType };
  type_checked: { metadata: U; input: string; type: LiteralType };
  code_element: {
    metadata: U;
    input: string;
    type: LiteralType;
    code_element: CodeRepresentation;
  };
  code_created: {
    metadata: U;
    input: string;
    type: LiteralType;
    code_element: CodeRepresentation;
    code: string;
  };
  evaluated: {
    metadata: U;
    input: string;
    type: LiteralType;
    code_element: CodeRepresentation;
    code: string;
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

type BaseFunctionUseStates<U> = AttachmentIntersection<
  TideAttachment<{
    unconstructed: { metadata: U };
    constructed: {
      metadata: U;
      function_name: string;
      module?: string;
    };
    syntax_checked: {
      metadata: U;
      function_name: string;
      module?: string;
    };
    name_checked: {
      metadata: U;
      location: Location;
      parameters: FunctionParameter[];
    };
    type_checked: {
      metadata: U;
      type: ValueType;
      location: Location;
      parameters: FunctionParameter[];
    };
    code_element: {
      metadata: U;
      type: ValueType;
      location: Location;
      parameters: FunctionParameter[];
      code_element: CodeRepresentation;
    };
    code_created: {
      metadata: U;
      type: ValueType;
      location: Location;
      parameters: FunctionParameter[];
      code_element: CodeRepresentation;
      code: string;
    };
    evaluated: {
      metadata: U;
      type: ValueType;
      location: Location;
      parameters: FunctionParameter[];
      code_element: CodeRepresentation;
      code: string;
      data: unknown;
    };
  }>,
  {
    [state in State]: state extends 'unconstructed'
      ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        {}
      : { children: TamaroCardChildren<U, state> };
  }
>;

export type TamaroCard_Functionuse_States<U> = Identity<
  BaseFunctionUseStates<U>
>;

export type TamaroCard_FunctionUse<
  U,
  S extends State = State,
> = Kind<'function_use'> & TamaroCard_Functionuse_States<U>[S];
