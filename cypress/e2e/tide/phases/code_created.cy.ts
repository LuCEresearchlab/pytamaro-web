import { ProgramState } from '../../../../src/tide/language/phases';
import { create_tree as phase1 } from '../utils';
import { default as phase2 } from '../../../../src/tide/language/phases/syntax';
import { default as phase3 } from '../../../../src/tide/language/phases/name';
import { default as phase4 } from '../../../../src/tide/language/phases/type';
import { default as phase5 } from '../../../../src/tide/language/phases/code_element';
import { default as code_create } from '../../../../src/tide/language/phases/code_created';
import { SoundType } from '../../../../src/tide/language/typing';

function create_tree(
  content: string,
): Omit<
  ProgramState<undefined, undefined, undefined, 'code_element'>,
  'imported_definitions'
> {
  const state = phase5(
    phase4(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      phase3(phase2(phase1(content) as any) as any) as any as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return evaluate_tree(state) as any;
}

function evaluate_tree(
  state: ProgramState<undefined, undefined, undefined, 'code_element'>,
): Omit<
  ProgramState<undefined, undefined, undefined, 'code_created'>,
  'imported_definitions'
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (code_create as any)(state) as ProgramState<
    undefined,
    undefined,
    undefined,
    'code_created'
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
          code_element: {
            expression: '1.',
            imports: [],
          },
          code: '1.',
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
          code_element: {
            expression: '1',
            imports: [],
          },
          code: '1',
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
          code_element: {
            expression: '"Hello World !"',
            imports: [],
          },
          code: '"Hello World !"',
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
          code_element: {
            expression: 'True',
            imports: [],
          },
          code: 'True',
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
          code_element: {
            expression: 'False',
            imports: [],
          },
          code: 'False',
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
          code_element: {
            expression: 'red',
            imports: [{ module: 'pytamaro', name: 'red' }],
          },
          type: SoundType.Color,
          code: 'from pytamaro import red\nred',
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
          code_element: {
            expression: 'a',
            imports: [
              {
                module: false,
                name: 'a',
              },
            ],
          },
          code: 'a = 1\na',
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
          code_element: {
            definition: 'a = 1',
            location: {
              module: false,
              name: 'a',
            },
            imports: [],
          },
          code: 'a = 1',
          root: {
            kind: 'literal',
            input: '1',
            type: SoundType.Int,
            metadata: undefined,
            code_element: {
              expression: '1',
              imports: [],
            },
            code: '1',
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
          type: SoundType.Color,
          metadata: undefined,
          code_element: {
            expression: 'a',
            imports: [
              {
                module: false,
                name: 'a',
              },
            ],
          },
          code: 'from pytamaro import red\na = red\na',
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
            type: 4,
            code_element: {
              expression: 'red',
              imports: [
                {
                  module: 'pytamaro',
                  name: 'red',
                },
              ],
            },
            code: 'from pytamaro import red\nred',
          },
          dependencies: [
            {
              module: 'pytamaro',
              name: 'red',
            },
          ],
          type: 4,
          code_element: {
            definition: 'a = red',
            location: {
              module: false,
              name: 'a',
            },
            imports: [
              {
                module: 'pytamaro',
                name: 'red',
              },
            ],
          },
          code: 'from pytamaro import red\na = red',
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

describe('Definitions ordering', () => {
  it('Imported multiple times', () => {
    expect(
      create_tree(
        'a := empty_graphic(); b := empty_graphic(); c := above(top_graphic = a, bottom_graphic = b); c',
      ),
    ).to.deep.equal({
      expressions: [
        {
          kind: 'constant_use',
          constant_name: 'c',
          location: {
            module: false,
            name: 'c',
          },
          type: 5,
          metadata: undefined,
          code_element: {
            expression: 'c',
            imports: [
              {
                module: false,
                name: 'c',
              },
            ],
          },
          code: 'from pytamaro import empty_graphic\na = empty_graphic()\nb = empty_graphic()\nfrom pytamaro import above\nc = above(a,b)\nc',
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
            metadata: undefined,
            kind: 'function_use',
            children: new Map(),
            function_name: 'empty_graphic',
            parameters: [],
            location: {
              module: 'pytamaro',
              name: 'empty_graphic',
            },
            type: 5,
            code_element: {
              expression: 'empty_graphic()',
              imports: [
                {
                  module: 'pytamaro',
                  name: 'empty_graphic',
                },
              ],
            },
            code: 'from pytamaro import empty_graphic\nempty_graphic()',
          },
          dependencies: [
            {
              module: 'pytamaro',
              name: 'empty_graphic',
            },
          ],
          type: 5,
          code_element: {
            definition: 'a = empty_graphic()',
            location: {
              module: false,
              name: 'a',
            },
            imports: [
              {
                module: 'pytamaro',
                name: 'empty_graphic',
              },
            ],
          },
          code: 'from pytamaro import empty_graphic\na = empty_graphic()',
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'b',
          },
          metadata: undefined,
          root: {
            metadata: undefined,
            kind: 'function_use',
            children: new Map(),
            function_name: 'empty_graphic',
            parameters: [],
            location: {
              module: 'pytamaro',
              name: 'empty_graphic',
            },
            type: 5,
            code_element: {
              expression: 'empty_graphic()',
              imports: [
                {
                  module: 'pytamaro',
                  name: 'empty_graphic',
                },
              ],
            },
            code: 'from pytamaro import empty_graphic\nempty_graphic()',
          },
          dependencies: [
            {
              module: 'pytamaro',
              name: 'empty_graphic',
            },
          ],
          type: 5,
          code_element: {
            definition: 'b = empty_graphic()',
            location: {
              module: false,
              name: 'b',
            },
            imports: [
              {
                module: 'pytamaro',
                name: 'empty_graphic',
              },
            ],
          },
          code: 'from pytamaro import empty_graphic\nb = empty_graphic()',
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'c',
          },
          metadata: undefined,
          root: {
            metadata: undefined,
            kind: 'function_use',
            children: new Map([
              [
                'top_graphic',
                {
                  kind: 'constant_use',
                  constant_name: 'a',
                  location: {
                    module: false,
                    name: 'a',
                  },
                  metadata: undefined,
                  type: 5,
                  code_element: {
                    expression: 'a',
                    imports: [
                      {
                        module: false,
                        name: 'a',
                      },
                    ],
                  },
                  code: 'from pytamaro import empty_graphic\na = empty_graphic()\na',
                },
              ],
              [
                'bottom_graphic',
                {
                  kind: 'constant_use',
                  constant_name: 'b',
                  location: {
                    module: false,
                    name: 'b',
                  },
                  metadata: undefined,
                  type: 5,
                  code_element: {
                    expression: 'b',
                    imports: [
                      {
                        module: false,
                        name: 'b',
                      },
                    ],
                  },
                  code: 'from pytamaro import empty_graphic\nb = empty_graphic()\nb',
                },
              ],
            ]),
            function_name: 'above',
            parameters: [
              {
                name: 'top_graphic',
                type: 5,
              },
              {
                name: 'bottom_graphic',
                type: 5,
              },
            ],
            location: {
              module: 'pytamaro',
              name: 'above',
            },
            type: 5,
            code_element: {
              expression: 'above(a,b)',
              imports: [
                {
                  module: false,
                  name: 'a',
                },
                {
                  module: false,
                  name: 'b',
                },
                {
                  module: 'pytamaro',
                  name: 'above',
                },
              ],
            },
            code: 'from pytamaro import empty_graphic\na = empty_graphic()\nb = empty_graphic()\nfrom pytamaro import above\nabove(a,b)',
          },
          dependencies: [
            {
              module: false,
              name: 'a',
            },
            {
              module: 'pytamaro',
              name: 'above',
            },
            {
              module: false,
              name: 'b',
            },
          ],
          type: 5,
          code_element: {
            definition: 'c = above(a,b)',
            location: {
              module: false,
              name: 'c',
            },
            imports: [
              {
                module: false,
                name: 'a',
              },
              {
                module: false,
                name: 'b',
              },
              {
                module: 'pytamaro',
                name: 'above',
              },
            ],
          },
          code: 'from pytamaro import empty_graphic\na = empty_graphic()\nb = empty_graphic()\nfrom pytamaro import above\nc = above(a,b)',
        },
      ],
    });
  });

  it('Hard order', () => {
    expect(
      create_tree('a := c; b:=d; c:=e; d:=f; e:=b; f:=red; a'),
    ).to.deep.equal({
      expressions: [
        {
          kind: 'constant_use',
          constant_name: 'a',
          location: {
            module: false,
            name: 'a',
          },
          metadata: undefined,
          type: 4,
          code_element: {
            expression: 'a',
            imports: [
              {
                module: false,
                name: 'a',
              },
            ],
          },
          code: 'from pytamaro import red\nf = red\nd = f\nb = d\ne = b\nc = e\na = c\na',
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
            metadata: undefined,
            kind: 'constant_use',
            constant_name: 'c',
            location: {
              module: false,
              name: 'c',
            },
            type: 4,
            code_element: {
              expression: 'c',
              imports: [
                {
                  module: false,
                  name: 'c',
                },
              ],
            },
            code: 'from pytamaro import red\nf = red\nd = f\nb = d\ne = b\nc = e\nc',
          },
          dependencies: [
            {
              module: false,
              name: 'c',
            },
          ],
          type: 4,
          code_element: {
            definition: 'a = c',
            location: {
              module: false,
              name: 'a',
            },
            imports: [
              {
                module: false,
                name: 'c',
              },
            ],
          },
          code: 'from pytamaro import red\nf = red\nd = f\nb = d\ne = b\nc = e\na = c',
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'b',
          },
          metadata: undefined,
          root: {
            metadata: undefined,
            kind: 'constant_use',
            constant_name: 'd',
            location: {
              module: false,
              name: 'd',
            },
            type: 4,
            code_element: {
              expression: 'd',
              imports: [
                {
                  module: false,
                  name: 'd',
                },
              ],
            },
            code: 'from pytamaro import red\nf = red\nd = f\nd',
          },
          dependencies: [
            {
              module: false,
              name: 'd',
            },
          ],
          type: 4,
          code_element: {
            definition: 'b = d',
            location: {
              module: false,
              name: 'b',
            },
            imports: [
              {
                module: false,
                name: 'd',
              },
            ],
          },
          code: 'from pytamaro import red\nf = red\nd = f\nb = d',
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'c',
          },
          metadata: undefined,
          root: {
            metadata: undefined,
            kind: 'constant_use',
            constant_name: 'e',
            location: {
              module: false,
              name: 'e',
            },
            type: 4,
            code_element: {
              expression: 'e',
              imports: [
                {
                  module: false,
                  name: 'e',
                },
              ],
            },
            code: 'from pytamaro import red\nf = red\nd = f\nb = d\ne = b\ne',
          },
          dependencies: [
            {
              module: false,
              name: 'e',
            },
          ],
          type: 4,
          code_element: {
            definition: 'c = e',
            location: {
              module: false,
              name: 'c',
            },
            imports: [
              {
                module: false,
                name: 'e',
              },
            ],
          },
          code: 'from pytamaro import red\nf = red\nd = f\nb = d\ne = b\nc = e',
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'd',
          },
          metadata: undefined,
          root: {
            metadata: undefined,
            kind: 'constant_use',
            constant_name: 'f',
            location: {
              module: false,
              name: 'f',
            },
            type: 4,
            code_element: {
              expression: 'f',
              imports: [
                {
                  module: false,
                  name: 'f',
                },
              ],
            },
            code: 'from pytamaro import red\nf = red\nf',
          },
          dependencies: [
            {
              module: false,
              name: 'f',
            },
          ],
          type: 4,
          code_element: {
            definition: 'd = f',
            location: {
              module: false,
              name: 'd',
            },
            imports: [
              {
                module: false,
                name: 'f',
              },
            ],
          },
          code: 'from pytamaro import red\nf = red\nd = f',
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'e',
          },
          metadata: undefined,
          root: {
            metadata: undefined,
            kind: 'constant_use',
            constant_name: 'b',
            location: {
              module: false,
              name: 'b',
            },
            type: 4,
            code_element: {
              expression: 'b',
              imports: [
                {
                  module: false,
                  name: 'b',
                },
              ],
            },
            code: 'from pytamaro import red\nf = red\nd = f\nb = d\nb',
          },
          dependencies: [
            {
              module: false,
              name: 'b',
            },
          ],
          type: 4,
          code_element: {
            definition: 'e = b',
            location: {
              module: false,
              name: 'e',
            },
            imports: [
              {
                module: false,
                name: 'b',
              },
            ],
          },
          code: 'from pytamaro import red\nf = red\nd = f\nb = d\ne = b',
        },
        {
          kind: 'constant_definition',
          subkind: 'local',
          location: {
            module: false,
            name: 'f',
          },
          metadata: undefined,
          root: {
            metadata: undefined,
            kind: 'constant_use',
            constant_name: 'red',
            location: {
              module: 'pytamaro',
              name: 'red',
            },
            type: 4,
            code_element: {
              expression: 'red',
              imports: [
                {
                  module: 'pytamaro',
                  name: 'red',
                },
              ],
            },
            code: 'from pytamaro import red\nred',
          },
          dependencies: [
            {
              module: 'pytamaro',
              name: 'red',
            },
          ],
          type: 4,
          code_element: {
            definition: 'f = red',
            location: {
              module: false,
              name: 'f',
            },
            imports: [
              {
                module: 'pytamaro',
                name: 'red',
              },
            ],
          },
          code: 'from pytamaro import red\nf = red',
        },
      ],
    });
  });
});
