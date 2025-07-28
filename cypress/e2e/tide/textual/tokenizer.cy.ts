import {
  tokenize,
  Token,
} from '../../../../src/tide/language/textual/tokenizer';

describe('Literal tokenizing', () => {
  it('number int', () => {
    expect(tokenize('1129391823')).to.deep.equal([
      { type: 'NUMBER', value: '1129391823' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('number float', () => {
    expect(tokenize('1129391823.1129391823')).to.deep.equal([
      { type: 'NUMBER', value: '1129391823.1129391823' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('number float (2)', () => {
    expect(tokenize('1129391823.')).to.deep.equal([
      { type: 'NUMBER', value: '1129391823.' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('boolean true', () => {
    expect(tokenize('True')).to.deep.equal([
      { type: 'BOOL', value: 'True' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('boolean false', () => {
    expect(tokenize('False')).to.deep.equal([
      { type: 'BOOL', value: 'False' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('string empty', () => {
    expect(tokenize('""')).to.deep.equal([
      { type: 'STRING', value: '""' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('string something', () => {
    expect(tokenize('"Hello World !"')).to.deep.equal([
      { type: 'STRING', value: '"Hello World !"' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });
});

describe('Identifier', () => {
  it('Identifier', () => {
    expect(tokenize('A')).to.deep.equal([
      { type: 'IDENTIFIER', value: 'A' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('Identifier (2)', () => {
    expect(tokenize('AZAZHEA12EHA9AHZeAZE_AHHhzha_hzae_jiae9')).to.deep.equal([
      {
        type: 'IDENTIFIER',
        value: 'AZAZHEA12EHA9AHZeAZE_AHHhzha_hzae_jiae9',
      } as Token,
      { type: 'EOF' } as Token,
    ]);
  });
});

describe('Simple lexem', () => {
  it('parenthesis open', () => {
    expect(tokenize('(')).to.deep.equal([
      { type: 'LPAREN' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('parenthesis close', () => {
    expect(tokenize(')')).to.deep.equal([
      { type: 'RPAREN' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('semicolon', () => {
    expect(tokenize(';')).to.deep.equal([
      { type: 'SEMICOLON' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('assignment operator :=', () => {
    expect(tokenize(':=')).to.deep.equal([
      { type: 'COLON_EQ' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('comma', () => {
    expect(tokenize(',')).to.deep.equal([
      { type: 'COMMA' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('equal', () => {
    expect(tokenize('=')).to.deep.equal([
      { type: 'EQUAL' } as Token,
      { type: 'EOF' } as Token,
    ]);
  });

  it('EOF', () => {
    expect(tokenize('')).to.deep.equal([{ type: 'EOF' } as Token]);
  });
});
