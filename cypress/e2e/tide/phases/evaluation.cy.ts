import { ProgramState } from '../../../../src/tide/language/phases';
import { create_tree as phase1 } from '../utils';
import { default as phase2 } from '../../../../src/tide/language/phases/syntax';
import { default as phase3 } from '../../../../src/tide/language/phases/name';
import { default as phase4 } from '../../../../src/tide/language/phases/type';
import { default as phase5 } from '../../../../src/tide/language/phases/code_element';
import { default as phase6 } from '../../../../src/tide/language/phases/code_created';
import { default as evaluate } from '../../../../src/tide/language/phases/evaluation';
import { SoundType } from '../../../../src/tide/language/typing';

function create_tree(
  content: string,
): Promise<
  Omit<
    ProgramState<undefined, undefined, undefined, 'evaluated'>,
    'imported_definitions'
  >
> {
  const state = phase6(
    phase5(
      phase4(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        phase3(phase2(phase1(content) as any) as any) as any as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return evaluate_tree(state) as any;
}

async function evaluate_tree(
  state: ProgramState<undefined, undefined, undefined, 'code_created'>,
): Promise<
  Omit<
    ProgramState<undefined, undefined, undefined, 'evaluated'>,
    'imported_definitions'
  >
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (await (evaluate as any)(state)) as ProgramState<
    undefined,
    undefined,
    undefined,
    'evaluated'
  >;

  return {
    expressions: result.expressions,
    local_definitions: result.local_definitions,
  };
}

describe('Literal Card', () => {
  it('float literal', async () => {
    expect(await create_tree('1.0')).to.deep.equal({
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
          data: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('float literal', async () => {
    expect(await create_tree('1')).to.deep.equal({
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
          data: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('string literal', async () => {
    expect(await create_tree('"Hello World !"')).to.deep.equal({
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
          data: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('bool true literal', async () => {
    expect(await create_tree('True')).to.deep.equal({
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
          data: undefined,
        },
      ],
      local_definitions: [],
    });
  });

  it('bool false literal', async () => {
    expect(await create_tree('False')).to.deep.equal({
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
          data: undefined,
        },
      ],
      local_definitions: [],
    });
  });
});
describe('Values', () => {
  it('Red color', async () => {
    expect(await create_tree('red')).to.deep.equal({
      expressions: [
        {
          kind: 'constant_use',
          constant_name: 'red',
          location: {
            module: 'pytamaro',
            name: 'red',
          },
          metadata: undefined,
          type: SoundType.Color,
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
          data: {
            red: 255,
            green: 0,
            blue: 0,
            alpha: 1,
          },
        },
      ],
      local_definitions: [],
    });
  });
  it('Red rectangle', async () => {
    expect(
      await create_tree('rectangle(width=100., height=100., color=red)'),
    ).to.deep.equal({
      expressions: [
        {
          kind: 'function_use',
          children: new Map([
            [
              'width',
              {
                kind: 'literal',
                metadata: undefined,
                data: undefined,
                input: '100.',
                type: 1,
                code_element: {
                  expression: '100.',
                  imports: [],
                },
                code: '100.',
              },
            ],
            [
              'height',
              {
                kind: 'literal',
                metadata: undefined,
                data: undefined,
                input: '100.',
                type: 1,
                code_element: {
                  expression: '100.',
                  imports: [],
                },
                code: '100.',
              },
            ],
            [
              'color',
              {
                kind: 'constant_use',
                metadata: undefined,
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
                data: {
                  red: 255,
                  green: 0,
                  blue: 0,
                  alpha: 1,
                },
              },
            ],
          ]),
          function_name: 'rectangle',
          metadata: undefined,
          parameters: [
            {
              name: 'width',
              type: 1,
            },
            {
              name: 'height',
              type: 1,
            },
            {
              name: 'color',
              type: 4,
            },
          ],
          location: {
            module: 'pytamaro',
            name: 'rectangle',
          },
          type: 5,
          code_element: {
            expression: 'rectangle(100.,100.,red)',
            imports: [
              {
                module: 'pytamaro',
                name: 'red',
              },
              {
                module: 'pytamaro',
                name: 'rectangle',
              },
            ],
          },
          code: 'from pytamaro import red\nfrom pytamaro import rectangle\nrectangle(100.,100.,red)',
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABAElEQVR4nO3RQQ0AIBDAsAP/nuGNAvZoFSzZOjNnyNi/A3gZEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIzAXsTALGT7m3PwAAAABJRU5ErkJggg==',
        },
      ],
      local_definitions: [],
    });
  });
  it('Runtime Error', async () => {
    expect(
      await create_tree('rectangle(width=-100., height=100., color=red)'),
    ).to.deep.equal({
      expressions: [
        {
          kind: 'function_use',
          children: new Map([
            [
              'width',
              {
                kind: 'literal',
                input: '-100.',
                metadata: undefined,
                data: undefined,
                type: 1,
                code_element: {
                  expression: '-100.',
                  imports: [],
                },
                code: '-100.',
              },
            ],
            [
              'height',
              {
                kind: 'literal',
                input: '100.',
                metadata: undefined,
                data: undefined,
                type: 1,
                code_element: {
                  expression: '100.',
                  imports: [],
                },
                code: '100.',
              },
            ],
            [
              'color',
              {
                kind: 'constant_use',
                metadata: undefined,
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
                data: {
                  red: 255,
                  green: 0,
                  blue: 0,
                  alpha: 1,
                },
              },
            ],
          ]),
          function_name: 'rectangle',
          parameters: [
            {
              name: 'width',
              type: 1,
            },
            {
              name: 'height',
              type: 1,
            },
            {
              name: 'color',
              type: 4,
            },
          ],
          location: {
            module: 'pytamaro',
            name: 'rectangle',
          },
          metadata: undefined,
          type: 5,
          code_element: {
            expression: 'rectangle(-100.,100.,red)',
            imports: [
              {
                module: 'pytamaro',
                name: 'red',
              },
              {
                module: 'pytamaro',
                name: 'rectangle',
              },
            ],
          },
          code: 'from pytamaro import red\nfrom pytamaro import rectangle\nrectangle(-100.,100.,red)',
          error_phase: 'evaluated',
          value: {
            kind: 'runtime-error',
            args: [
              {
                name: 'error',
                value: 'ValueError: Invalid length for parameter `width`',
              },
            ],
          },
        },
      ],
      local_definitions: [],
    });
  });
});
