import { Token, tokenize, TokenType } from './tokenizer';
import {
  Program,
  Definition,
  Definitions,
  Root,
  Expression,
  FunctionUse,
  Arg,
} from './types';

export class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(future: number = 0): Token {
    return this.tokens[this.pos + future];
  }
  private consume(type?: TokenType): Token {
    const token = this.tokens[this.pos++];
    if (type && token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type}`);
    }
    return token;
  }

  parseProgram(): Program {
    const definitions = this.parseDefinitions();
    const root = this.parseRoot();
    this.consume('EOF');
    return { type: 'Program', definitions, root };
  }

  private parseDefinitions(): Definitions {
    const defs: Definitions = [];
    while (
      this.peek().type === 'IDENTIFIER' &&
      (this.peek(1)?.type === 'COLON_EQ' || this.peek(1)?.type === 'SEMICOLON')
    ) {
      defs.push(this.parseDefinition());
    }
    return defs;
  }

  private parseDefinition(): Definition {
    const name = this.consume('IDENTIFIER').value!;
    let value: undefined | Expression;
    if (this.peek().type === 'COLON_EQ') {
      this.consume('COLON_EQ');
      value = this.parseExpression();
      this.consume('SEMICOLON');
    }
    return { type: 'Definition', name, value };
  }

  private parseRoot(): Root {
    const expression = this.parseExpression();
    return { type: 'Root', expression };
  }

  private parseExpression(): Expression {
    const token = this.peek();
    switch (token.type) {
      case 'NUMBER': {
        const value = this.consume().value!;
        return value.includes('.')
          ? {
              type: 'LiteralFloat',
              value: parseFloat(value),
            }
          : {
              type: 'LiteralInt',
              value: parseInt(value),
            };
      }
      case 'STRING':
        return { type: 'LiteralString', value: this.consume().value! };
      case 'BOOL':
        return { type: 'LiteralBool', value: this.consume().value! === 'True' };
      case 'IDENTIFIER': {
        const id = this.consume('IDENTIFIER').value!;
        if (this.peek().type === 'LPAREN') {
          return this.parseFunctionUse(id);
        } else {
          return { type: 'ConstantUse', name: id };
        }
      }
      default:
        throw new Error(`Unexpected token: ${token.type}`);
    }
  }

  private parseFunctionUse(name: string): FunctionUse {
    this.consume('LPAREN');
    const args: Arg[] = [];
    if (this.peek().type !== 'RPAREN') {
      args.push(this.parseArg());
      while (this.peek().type === 'COMMA') {
        this.consume('COMMA');
        args.push(this.parseArg());
      }
    }
    this.consume('RPAREN');
    return { type: 'FunctionUse', name, args };
  }

  private parseArg(): Arg {
    const name = this.consume('IDENTIFIER').value!;
    this.consume('EQUAL');
    const value = this.parseExpression();
    return { type: 'Arg', name, value };
  }
}

export default function parseTextualTide(content: string) {
  return new Parser(tokenize(content)).parseProgram();
}
