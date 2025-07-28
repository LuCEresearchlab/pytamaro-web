import parse from '../../../../src/tide/language/textual/parser';

describe('Literal', () => {
  it('literal int', () => {
    expect(parse('11231239')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'LiteralInt',
          value: 11231239,
        },
      },
    });
  });

  it('literal float', () => {
    expect(parse('11231239.11231239')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'LiteralFloat',
          value: 11231239.11231239,
        },
      },
    });
  });

  it('literal float (2)', () => {
    expect(parse('11231239.')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'LiteralFloat',
          value: 11231239,
        },
      },
    });
  });

  it('literal bool true', () => {
    expect(parse('True')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'LiteralBool',
          value: true,
        },
      },
    });
  });

  it('literal bool false', () => {
    expect(parse('False')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'LiteralBool',
          value: false,
        },
      },
    });
  });

  it('literal string empty', () => {
    expect(parse('""')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'LiteralString',
          value: '""',
        },
      },
    });
  });

  it('literal string text', () => {
    expect(parse('"Hello World"')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'LiteralString',
          value: '"Hello World"',
        },
      },
    });
  });
});

describe('No definition', () => {
  it('constant use (identifier)', () => {
    expect(parse('MyConst')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'ConstantUse',
          name: 'MyConst',
        },
      },
    });
  });

  it('function call no args', () => {
    expect(parse('MyFunc()')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'FunctionUse',
          name: 'MyFunc',
          args: [],
        },
      },
    });
  });

  it('function call single arg', () => {
    expect(parse('MyFunc(x=1)')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'FunctionUse',
          name: 'MyFunc',
          args: [
            {
              type: 'Arg',
              name: 'x',
              value: {
                type: 'LiteralInt',
                value: 1,
              },
            },
          ],
        },
      },
    });
  });

  it('function call multiple args', () => {
    expect(parse('MyFunc(a=1,b=2,c="Hello")')).to.deep.eq({
      type: 'Program',
      definitions: [],
      root: {
        type: 'Root',
        expression: {
          type: 'FunctionUse',
          name: 'MyFunc',
          args: [
            {
              type: 'Arg',
              name: 'a',
              value: { type: 'LiteralInt', value: 1 },
            },
            {
              type: 'Arg',
              name: 'b',
              value: { type: 'LiteralInt', value: 2 },
            },
            {
              type: 'Arg',
              name: 'c',
              value: { type: 'LiteralString', value: '"Hello"' },
            },
          ],
        },
      },
    });
  });
});

describe('Constant definitions', () => {
  it('single int definition then usage', () => {
    expect(parse('x := 42; x')).to.deep.eq({
      type: 'Program',
      definitions: [
        {
          type: 'Definition',
          name: 'x',
          value: {
            type: 'LiteralInt',
            value: 42,
          },
        },
      ],
      root: {
        type: 'Root',
        expression: {
          type: 'ConstantUse',
          name: 'x',
        },
      },
    });
  });

  it('single float definition then usage', () => {
    expect(parse('pi := 3.14; pi')).to.deep.eq({
      type: 'Program',
      definitions: [
        {
          type: 'Definition',
          name: 'pi',
          value: {
            type: 'LiteralFloat',
            value: 3.14,
          },
        },
      ],
      root: {
        type: 'Root',
        expression: {
          type: 'ConstantUse',
          name: 'pi',
        },
      },
    });
  });

  it('single string definition then usage', () => {
    expect(parse('greeting := "Hello"; greeting')).to.deep.eq({
      type: 'Program',
      definitions: [
        {
          type: 'Definition',
          name: 'greeting',
          value: {
            type: 'LiteralString',
            value: '"Hello"',
          },
        },
      ],
      root: {
        type: 'Root',
        expression: {
          type: 'ConstantUse',
          name: 'greeting',
        },
      },
    });
  });

  it('single bool definition then usage', () => {
    expect(parse('flag := True; flag')).to.deep.eq({
      type: 'Program',
      definitions: [
        {
          type: 'Definition',
          name: 'flag',
          value: {
            type: 'LiteralBool',
            value: true,
          },
        },
      ],
      root: {
        type: 'Root',
        expression: {
          type: 'ConstantUse',
          name: 'flag',
        },
      },
    });
  });

  it('multiple definitions then usage', () => {
    expect(parse('x := 1; y := 2; x')).to.deep.eq({
      type: 'Program',
      definitions: [
        {
          type: 'Definition',
          name: 'x',
          value: { type: 'LiteralInt', value: 1 },
        },
        {
          type: 'Definition',
          name: 'y',
          value: { type: 'LiteralInt', value: 2 },
        },
      ],
      root: {
        type: 'Root',
        expression: {
          type: 'ConstantUse',
          name: 'x',
        },
      },
    });
  });

  it('definition with function call as value', () => {
    expect(parse('result := Add(a=1,b=2); result')).to.deep.eq({
      type: 'Program',
      definitions: [
        {
          type: 'Definition',
          name: 'result',
          value: {
            type: 'FunctionUse',
            name: 'Add',
            args: [
              {
                type: 'Arg',
                name: 'a',
                value: { type: 'LiteralInt', value: 1 },
              },
              {
                type: 'Arg',
                name: 'b',
                value: { type: 'LiteralInt', value: 2 },
              },
            ],
          },
        },
      ],
      root: {
        type: 'Root',
        expression: {
          type: 'ConstantUse',
          name: 'result',
        },
      },
    });
  });

  it('definition with identifier reference as value', () => {
    expect(parse('base := 10; copy := base; copy')).to.deep.eq({
      type: 'Program',
      definitions: [
        {
          type: 'Definition',
          name: 'base',
          value: { type: 'LiteralInt', value: 10 },
        },
        {
          type: 'Definition',
          name: 'copy',
          value: { type: 'ConstantUse', name: 'base' },
        },
      ],
      root: {
        type: 'Root',
        expression: {
          type: 'ConstantUse',
          name: 'copy',
        },
      },
    });
  });
});
