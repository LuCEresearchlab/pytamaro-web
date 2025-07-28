// === Tokenizer ===
export type TokenType =
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'BOOL'
  | 'COLON_EQ'
  | 'SEMICOLON'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'EQUAL'
  | 'EOF';

export interface Token {
  type: TokenType;
  value?: string;
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const regex =
    /\s*([a-zA-Z][a-zA-Z0-9_]*|\d+\.\d*|\d+|"[^"]*"|:=|True|False|[;(),=])/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    const [, value] = match;
    if (!value.trim()) continue;

    if (value === ':=') tokens.push({ type: 'COLON_EQ' });
    else if (value === ';') tokens.push({ type: 'SEMICOLON' });
    else if (value === '(') tokens.push({ type: 'LPAREN' });
    else if (value === ')') tokens.push({ type: 'RPAREN' });
    else if (value === ',') tokens.push({ type: 'COMMA' });
    else if (value === '=') tokens.push({ type: 'EQUAL' });
    else if (value === 'True' || value === 'False')
      tokens.push({ type: 'BOOL', value });
    else if (/^\d/.test(value)) tokens.push({ type: 'NUMBER', value });
    else if (/^"/.test(value)) tokens.push({ type: 'STRING', value: value });
    else tokens.push({ type: 'IDENTIFIER', value });
  }

  tokens.push({ type: 'EOF' });
  return tokens;
}
