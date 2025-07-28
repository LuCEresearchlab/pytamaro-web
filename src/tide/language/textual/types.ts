export type Identifier = string;

export interface Definition {
  type: 'Definition';
  name: Identifier;
  value: Expression;
}

export type Definitions = Definition[];

export interface LiteralFloat {
  type: 'LiteralFloat';
  value: number;
}

export interface LiteralInt {
  type: 'LiteralInt';
  value: number;
}

export type LiteralNumber = LiteralFloat | LiteralInt;

export interface LiteralString {
  type: 'LiteralString';
  value: string;
}

export interface LiteralBool {
  type: 'LiteralBool';
  value: boolean;
}

export type Literal = LiteralNumber | LiteralString | LiteralBool;

export interface Arg {
  type: 'Arg';
  name: Identifier;
  value: Expression;
}

export interface FunctionUse {
  type: 'FunctionUse';
  name: Identifier;
  args: Arg[];
}

export interface ConstantUse {
  type: 'ConstantUse';
  name: Identifier;
}

export type Expression = Literal | FunctionUse | ConstantUse;

export interface Root {
  type: 'Root';
  expression: Expression;
}

export interface Program {
  type: 'Program';
  definitions: Definitions;
  root: Root;
}
