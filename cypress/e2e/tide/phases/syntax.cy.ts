import { TamaroCard } from '../../../../src/tide/language/cards';
import { LocalDefinition } from '../../../../src/tide/language/definitions';
import { ProgramState } from '../../../../src/tide/language/phases';
import { default as syntax_phase } from '../../../../src/tide/language/phases/syntax';
import { SoundType } from '../../../../src/tide/language/typing';
import { getDefaultContext } from '../data';
import { create_tree as phase1 } from '../utils';

function create_tree(
  content: string,
): Omit<
  ProgramState<undefined, undefined, undefined, 'syntax_checked'>,
  'imported_definitions'
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state = phase1(content) as any;
  return evaluate_tree(state);
}

function evaluate_tree(
  state: ProgramState<undefined, undefined, undefined, 'constructed'>,
): Omit<
  ProgramState<undefined, undefined, undefined, 'syntax_checked'>,
  'imported_definitions'
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (syntax_phase as any)(state) as ProgramState<
    undefined,
    undefined,
    undefined,
    'syntax_checked'
  >;

  return {
    expressions: result.expressions,
    local_definitions: result.local_definitions,
  };
}

function evaluate_cards(
  expression: TamaroCard<undefined, 'constructed'>,
  definitions: LocalDefinition<undefined, undefined, 'constructed'>[] = [],
) {
  const imported = getDefaultContext();

  return evaluate_tree({
    imported_definitions: imported.map((v) => ({ ...v, metadata: undefined })),
    expressions: [expression],
    local_definitions: definitions,
  });
}

describe('Literal Card', () => {
  it('float literal', () => {
    expect(create_tree('1.0')).to.deep.equal({
      expressions: [
        {
          input: '1.',
          kind: 'literal',
          type: SoundType.Float,
          metadata: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('float literal', () => {
    expect(create_tree('1')).to.deep.equal({
      expressions: [
        {
          input: '1',
          kind: 'literal',
          type: SoundType.Int,
          metadata: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('string literal', () => {
    expect(create_tree('"Hello World !"')).to.deep.equal({
      expressions: [
        {
          input: '"Hello World !"',
          kind: 'literal',
          type: SoundType.Str,
          metadata: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('bool true literal', () => {
    expect(create_tree('True')).to.deep.equal({
      expressions: [
        {
          input: 'True',
          kind: 'literal',
          type: SoundType.Bool,
          metadata: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('bool false literal', () => {
    expect(create_tree('False')).to.deep.equal({
      expressions: [
        {
          input: 'False',
          kind: 'literal',
          type: SoundType.Bool,
          metadata: undefined,
        },
      ],
      local_definitions: [],
    });
  });
});

describe('Constant & Function Use with dependencies', () => {
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
          root: {
            input: '1',
            kind: 'literal',
            type: SoundType.Int,
            metadata: undefined,
          },
          dependencies: [],
          metadata: undefined,
        },
      ],
    });
  });

  it('Local constant with simple dependency', () => {
    expect(create_tree('a := red; a')).to.deep.equal({
      expressions: [
        { constant_name: 'a', kind: 'constant_use', metadata: undefined },
      ],
      local_definitions: [
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: { module: false, name: 'a' },
          root: {
            constant_name: 'red',
            kind: 'constant_use',
            metadata: undefined,
          },
          dependencies: ['red'],
          metadata: undefined,
        },
      ],
    });
  });

  it('Local constant with mutliple dependencies', () => {
    expect(create_tree('a := f(value=red, value2=g(v=f)); a')).to.deep.equal({
      expressions: [
        { constant_name: 'a', kind: 'constant_use', metadata: undefined },
      ],
      local_definitions: [
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'a',
          },
          root: {
            kind: 'function_use',
            children: new Map([
              [
                'value',
                {
                  kind: 'constant_use',
                  constant_name: 'red',
                  metadata: undefined,
                },
              ],
              [
                'value2',
                {
                  kind: 'function_use',
                  children: new Map([
                    [
                      'v',
                      {
                        kind: 'constant_use',
                        constant_name: 'f',
                        metadata: undefined,
                      },
                    ],
                  ]),
                  metadata: undefined,
                  function_name: 'g',
                },
              ],
            ]),
            metadata: undefined,
            function_name: 'f',
          },
          metadata: undefined,
          dependencies: ['f', 'g', 'red'],
        },
      ],
    });
  });
});

describe('Syntax Errors', () => {
  it('Constant Has no value', () => {
    expect(create_tree('a; b; 1')).to.deep.equal({
      expressions: [
        {
          kind: 'literal',
          input: '1',
          type: 0,
          metadata: undefined,
        },
      ],
      local_definitions: [
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'a',
          },
          error_phase: 'syntax_checked',
          root: undefined,
          type: {
            error: {
              kind: 'syntax-error',
              subkind: 'constant_has_no_value',
              args: [
                {
                  name: 'name',
                  value: 'a',
                },
              ],
            },
          },
          metadata: undefined,
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'b',
          },
          error_phase: 'syntax_checked',
          root: undefined,
          type: {
            error: {
              kind: 'syntax-error',
              subkind: 'constant_has_no_value',
              args: [
                {
                  name: 'name',
                  value: 'b',
                },
              ],
            },
          },
          metadata: undefined,
        },
      ],
    });
  });
  it('Invalid Constant', () => {
    expect(
      evaluate_cards({
        kind: 'constant_use',
        constant_name: 'def',
        metadata: undefined,
      }),
    ).to.deep.equal({
      expressions: [
        {
          kind: 'constant_use',
          constant_name: 'def',
          error_phase: 'syntax_checked',
          metadata: undefined,
          type: {
            error: {
              kind: 'syntax-error',
              subkind: 'invalid_constant_identifier',
              args: [
                {
                  name: 'name',
                  value: 'def',
                },
              ],
            },
          },
        },
      ],
      local_definitions: [],
    });
  });
  it('Invalid Function Use', () => {
    expect(
      evaluate_cards({
        kind: 'function_use',
        function_name: 'def',
        children: new Map(),
        metadata: undefined,
      }),
    ).to.deep.equal({
      expressions: [
        {
          kind: 'function_use',
          function_name: 'def',
          children: new Map(),
          error_phase: 'syntax_checked',
          metadata: undefined,
          type: {
            error: {
              kind: 'syntax-error',
              subkind: 'invalid_function_identifier',
              args: [
                {
                  name: 'name',
                  value: 'def',
                },
              ],
            },
          },
        },
      ],
      local_definitions: [],
    });
  });
  it('Invalid Literal', () => {
    expect(
      evaluate_cards({
        kind: 'literal',
        input: "'",
        metadata: undefined,
      }),
    ).to.deep.equal({
      expressions: [
        {
          kind: 'literal',
          input: "'",
          error_phase: 'syntax_checked',
          metadata: undefined,
          type: {
            error: {
              kind: 'syntax-error',
              subkind: 'invalid_literal',
              args: [
                {
                  name: 'value',
                  value: "'",
                },
              ],
            },
          },
        },
      ],
      local_definitions: [],
    });
  });
});
