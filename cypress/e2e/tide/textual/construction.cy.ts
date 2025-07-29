import { create_tree } from '../utils';
describe('Literal Card', () => {
  it('float literal', () => {
    expect(create_tree('1.0')).to.deep.equal({
      expressions: [{ input: '1.', kind: 'literal', metadata: undefined }],
      local_definitions: [],
    });
  });

  it('float literal', () => {
    expect(create_tree('1')).to.deep.equal({
      expressions: [{ input: '1', kind: 'literal', metadata: undefined }],
      local_definitions: [],
    });
  });

  it('string literal', () => {
    expect(create_tree('"Hello World !"')).to.deep.equal({
      expressions: [
        { input: '"Hello World !"', kind: 'literal', metadata: undefined },
      ],
      local_definitions: [],
    });
  });

  it('bool true literal', () => {
    expect(create_tree('True')).to.deep.equal({
      expressions: [{ input: 'True', kind: 'literal', metadata: undefined }],
      local_definitions: [],
    });
  });

  it('bool false literal', () => {
    expect(create_tree('False')).to.deep.equal({
      expressions: [{ input: 'False', kind: 'literal', metadata: undefined }],
      local_definitions: [],
    });
  });
});

describe('Constant Use', () => {
  it('Not defined constant', () => {
    expect(create_tree('a')).to.deep.equal({
      expressions: [
        { constant_name: 'a', kind: 'constant_use', metadata: undefined },
      ],
      local_definitions: [],
    });
  });

  it('Imported constant', () => {
    expect(create_tree('red')).to.deep.equal({
      expressions: [
        { constant_name: 'red', kind: 'constant_use', metadata: undefined },
      ],
      local_definitions: [],
    });
  });

  it('Local constant', () => {
    expect(create_tree('a := 1; a')).to.deep.equal({
      expressions: [
        { constant_name: 'a', kind: 'constant_use', metadata: undefined },
      ],
      local_definitions: [
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: { module: false, name: 'a' },
          root: { input: '1', kind: 'literal', metadata: undefined },
          metadata: undefined,
        },
      ],
    });
  });
});

describe('Function Use', () => {
  it('Function use no args', () => {
    expect(create_tree('f()')).to.deep.equal({
      expressions: [
        {
          function_name: 'f',
          kind: 'function_use',
          children: new Map(),
          metadata: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('Function use one arg', () => {
    expect(create_tree('f(a=1)')).to.deep.equal({
      expressions: [
        {
          function_name: 'f',
          kind: 'function_use',
          children: new Map([
            ['a', { input: '1', kind: 'literal', metadata: undefined }],
          ]),
          metadata: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('Function use multiple args', () => {
    expect(
      create_tree('f(a=1, b="Hello World !", c="Test2", d=True)'),
    ).to.deep.equal({
      expressions: [
        {
          function_name: 'f',
          kind: 'function_use',
          children: new Map([
            ['a', { input: '1', kind: 'literal', metadata: undefined }],
            [
              'b',
              {
                input: '"Hello World !"',
                kind: 'literal',
                metadata: undefined,
              },
            ],
            ['c', { input: '"Test2"', kind: 'literal', metadata: undefined }],
            ['d', { input: 'True', kind: 'literal', metadata: undefined }],
          ]),
          metadata: undefined,
        },
      ],
      local_definitions: [],
    });
  });
});
