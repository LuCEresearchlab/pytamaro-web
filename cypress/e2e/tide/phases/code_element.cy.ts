import { ProgramState } from '../../../../src/tide/language/phases';
import { create_tree as phase1 } from '../utils';
import { default as phase2 } from '../../../../src/tide/language/phases/syntax';
import { default as phase3 } from '../../../../src/tide/language/phases/name';
import { default as phase4 } from '../../../../src/tide/language/phases/type';
import { default as code_create } from '../../../../src/tide/language/phases/code_element';
import { SoundType } from '../../../../src/tide/language/typing';

function create_tree(
  content: string,
): Omit<
  ProgramState<undefined, undefined, undefined, 'type_checked'>,
  'imported_definitions'
> {
  const state = phase4(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    phase3(phase2(phase1(content) as any) as any) as any as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return evaluate_tree(state) as any;
}

function evaluate_tree(
  state: ProgramState<undefined, undefined, undefined, 'type_checked'>,
): Omit<
  ProgramState<undefined, undefined, undefined, 'code_element'>,
  'imported_definitions'
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (code_create as any)(state) as ProgramState<
    undefined,
    undefined,
    undefined,
    'code_element'
  >;

  return {
    expressions: result.expressions,
    local_definitions: result.local_definitions,
  };
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
          code: {
            expression: '1.',
            imports: [],
          },
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
          code: {
            expression: '1',
            imports: [],
          },
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
          code: {
            expression: '"Hello World !"',
            imports: [],
          },
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
          code: {
            expression: 'True',
            imports: [],
          },
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
          code: {
            expression: 'False',
            imports: [],
          },
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
        {
          kind: 'constant_use',
          constant_name: 'a',
          error_phase: 'name_checked',
          metadata: undefined,
          type: {
            error: {
              kind: 'name-error',
              subkind: 'unknown_constant',
              args: [
                {
                  name: 'name',
                  value: 'a',
                },
              ],
            },
          },
        },
      ],
      local_definitions: [],
    });
  });

  it('Imported constant', () => {
    expect(create_tree('red')).to.deep.equal({
      expressions: [
        {
          kind: 'constant_use',
          constant_name: 'red',
          metadata: undefined,
          location: {
            module: 'pytamaro',
            name: 'red',
          },
          code: {
            expression: 'red',
            imports: [{ module: 'pytamaro', name: 'red' }],
          },
          type: SoundType.Color,
        },
      ],
      local_definitions: [],
    });
  });

  it('Local constant', () => {
    expect(create_tree('a := 1; a')).to.deep.equal({
      expressions: [
        {
          kind: 'constant_use',
          constant_name: 'a',
          metadata: undefined,
          location: {
            module: false,
            name: 'a',
          },
          code: {
            expression: 'a',
            imports: [
              {
                module: false,
                name: 'a',
              },
            ],
          },
          type: SoundType.Int,
        },
      ],
      local_definitions: [
        {
          kind: 'constant_definition',
          subkind: 'local',
          metadata: undefined,
          location: {
            module: false,
            name: 'a',
          },
          code: {
            definition: 'a = 1',
            location: {
              module: false,
              name: 'a',
            },
            imports: [],
          },
          root: {
            kind: 'literal',
            input: '1',
            type: SoundType.Int,
            metadata: undefined,
            code: {
              expression: '1',
              imports: [],
            },
          },
          type: SoundType.Int,
          dependencies: [],
        },
      ],
    });
  });

  it('Local constant with simple dependency', () => {
    expect(create_tree('a := red; a')).to.deep.equal({
      expressions: [
        {
          kind: 'constant_use',
          constant_name: 'a',
          location: {
            module: false,
            name: 'a',
          },
          metadata: undefined,
          type: SoundType.Color,
          code: {
            expression: 'a',
            imports: [
              {
                module: false,
                name: 'a',
              },
            ],
          },
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
          metadata: undefined,
          root: {
            kind: 'constant_use',
            constant_name: 'red',
            location: {
              module: 'pytamaro',
              name: 'red',
            },
            metadata: undefined,
            type: SoundType.Color,
            code: {
              expression: 'red',
              imports: [
                {
                  module: 'pytamaro',
                  name: 'red',
                },
              ],
            },
          },
          dependencies: [
            {
              module: 'pytamaro',
              name: 'red',
            },
          ],
          type: SoundType.Color,
          code: {
            definition: 'a = red',
            location: {
              module: false,
              name: 'a',
            },
            imports: [],
          },
        },
      ],
    });
  });

  it('Circular dependency with simple dependency', () => {
    expect(create_tree('a := b; b := a; a')).to.deep.equal({
      expressions: [
        {
          kind: 'constant_use',
          constant_name: 'a',
          error_phase: 'name_checked',
          type: false,
          metadata: undefined,
        },
      ],
      local_definitions: [
        {
          kind: 'constant_definition',
          subkind: 'local',
          metadata: undefined,
          location: {
            module: false,
            name: 'a',
          },
          root: {
            kind: 'constant_use',
            constant_name: 'b',
            metadata: undefined,
          },
          dependencies: ['b'],
          error_phase: 'name_checked',
          type: {
            error: {
              kind: 'name-error',
              subkind: 'cyclical_dependencies',
              args: [
                {
                  name: 'names',
                  value: ['a', 'b'],
                },
              ],
            },
          },
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          metadata: undefined,
          location: {
            module: false,
            name: 'b',
          },
          root: {
            kind: 'constant_use',
            constant_name: 'a',
            metadata: undefined,
          },
          dependencies: ['a'],
          error_phase: 'name_checked',
          type: {
            error: {
              kind: 'name-error',
              subkind: 'cyclical_dependencies',
              args: [
                {
                  name: 'names',
                  value: ['b', 'a'],
                },
              ],
            },
          },
        },
      ],
    });
  });

  it('Circular dependency with complex dependency', () => {
    expect(create_tree('a := b; b := c; c := d; d:=e; e:=a; a')).to.deep.equal({
      expressions: [
        {
          kind: 'constant_use',
          constant_name: 'a',
          type: false,
          error_phase: 'name_checked',
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
          root: {
            kind: 'constant_use',
            constant_name: 'b',
            metadata: undefined,
          },
          dependencies: ['b'],
          error_phase: 'name_checked',
          metadata: undefined,
          type: {
            error: {
              kind: 'name-error',
              subkind: 'cyclical_dependencies',
              args: [
                {
                  name: 'names',
                  value: ['a', 'e', 'd', 'c', 'b'],
                },
              ],
            },
          },
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'b',
          },
          root: {
            kind: 'constant_use',
            constant_name: 'c',
            metadata: undefined,
          },
          metadata: undefined,
          dependencies: ['c'],
          error_phase: 'name_checked',
          type: {
            error: {
              kind: 'name-error',
              subkind: 'cyclical_dependencies',
              args: [
                {
                  name: 'names',
                  value: ['b', 'a', 'e', 'd', 'c'],
                },
              ],
            },
          },
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'c',
          },
          root: {
            kind: 'constant_use',
            constant_name: 'd',
            metadata: undefined,
          },
          metadata: undefined,
          dependencies: ['d'],
          error_phase: 'name_checked',
          type: {
            error: {
              kind: 'name-error',
              subkind: 'cyclical_dependencies',
              args: [
                {
                  name: 'names',
                  value: ['c', 'b', 'a', 'e', 'd'],
                },
              ],
            },
          },
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'd',
          },
          root: {
            kind: 'constant_use',
            constant_name: 'e',
            metadata: undefined,
          },
          dependencies: ['e'],
          metadata: undefined,
          error_phase: 'name_checked',
          type: {
            error: {
              kind: 'name-error',
              subkind: 'cyclical_dependencies',
              args: [
                {
                  name: 'names',
                  value: ['d', 'c', 'b', 'a', 'e'],
                },
              ],
            },
          },
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'e',
          },
          root: {
            kind: 'constant_use',
            constant_name: 'a',
            metadata: undefined,
          },
          metadata: undefined,
          dependencies: ['a'],
          error_phase: 'name_checked',
          type: {
            error: {
              kind: 'name-error',
              subkind: 'cyclical_dependencies',
              args: [
                {
                  name: 'names',
                  value: ['e', 'd', 'c', 'b', 'a'],
                },
              ],
            },
          },
        },
      ],
    });
  });
});
