import {
  EvaluatedTamaroCard_Literal,
  TamaroCard,
  TamaroCard_Literal,
} from '../../../src/tide/cards';
import { EvaluatedContext } from '../../../src/tide/context';
import { TideRuntimeError_builder } from '../../../src/tide/error_builders';
import { evaluate_tree } from '../../../src/tide/evaluation';
import {
  compareLocation,
  Location,
  SoundType,
  UnsoundType,
} from '../../../src/tide/expression';
import { getDefaultContext, RECTANGLE, RED } from './data';

function literal_card(
  value: string,
  type: SoundType.Float | SoundType.Str | SoundType.Bool,
): TamaroCard_Literal<object> {
  return {
    kind: 'literal',
    str_value: value,
    metadata: {},
    type,
  };
}

function literal_card_evaluated(
  value: string,
  type: SoundType.Float | SoundType.Str | SoundType.Bool,
): EvaluatedTamaroCard_Literal<object> {
  return {
    ...literal_card(value, type),
    value: {
      type,
      value: {
        expression: value,
        imports: [],
      },
    },
  };
}

describe('Unit test literal evaluation', () => {
  // cy.visit('/playground');
  it('evaluate_literal_float', async () => {
    expect(
      await evaluate_tree(literal_card('1.0', SoundType.Float), []),
    ).to.deep.eq(literal_card_evaluated('1.0', SoundType.Float));
  });

  it('evaluate_literal_str', async () => {
    expect(
      await evaluate_tree(literal_card('"Hello World !"', SoundType.Str), []),
    ).to.deep.eq(literal_card_evaluated('"Hello World !"', SoundType.Str));
  });

  it('evaluate_literal_bool', async () => {
    expect(
      await evaluate_tree(literal_card('True', SoundType.Bool), []),
    ).to.deep.eq(literal_card_evaluated('True', SoundType.Bool));
  });
});

describe('Unit test constant use', () => {
  it('evaluate_imported_constant_use', async () => {
    const map: EvaluatedContext<object> = getDefaultContext();

    expect(
      await evaluate_tree(
        { kind: 'constant_use', import: RED.import, metadata: {} },
        map,
      ),
    ).to.deep.eq({
      ...{ kind: 'constant_use', import: RED.import, metadata: {} },
      value: {
        type: SoundType.Color,
        value: {
          expression: RED.import.name,
          imports: [RED.import],
        },
      },
    });
  });

  it('evaluate_local_constant_use', async () => {
    const map: EvaluatedContext<object> = [];
    const import_size: Location = { module: false, name: 'size' };
    map.push({
      kind: 'constant_definition',
      subkind: 'local',
      dependencies: [],
      evaluated: true,
      import: import_size,
      root: literal_card('100.0', SoundType.Float),
      value: {
        type: SoundType.Float,
        value: {
          expression: '100.0',
          imports: [],
        },
      },
    });

    expect(
      await evaluate_tree(
        { kind: 'constant_use', import: import_size, metadata: {} },
        map,
      ),
    ).to.deep.eq({
      ...{ kind: 'constant_use', import: import_size, metadata: {} },
      value: {
        type: SoundType.Float,
        value: {
          expression: import_size.name,
          imports: [import_size],
        },
      },
    });
  });
});

describe('Unit test function use', () => {
  it('evalute_simple_function_use', async () => {
    const map: EvaluatedContext<object> = getDefaultContext();

    const arg_map: Map<string, TamaroCard<[], object>> = new Map();
    arg_map.set('width', literal_card('100.0', SoundType.Float));
    arg_map.set('height', literal_card('100.0', SoundType.Float));
    arg_map.set('color', {
      kind: 'constant_use',
      import: RED.import,
      metadata: {},
    });

    expect(
      await evaluate_tree(
        {
          kind: 'function_use',
          children: arg_map,
          import: RECTANGLE.import,
          metadata: {},
        },
        map,
      ).then((v) => v.value),
    ).to.deep.eq({
      type: SoundType.Graphic,
      value: {
        expression: 'rectangle(100.0, 100.0, red)',
        imports: [RECTANGLE.import, RED.import].sort(compareLocation),
      },
    });
  });

  it('evaluate_local_constant_use_inside_function_use', async () => {
    const map: EvaluatedContext<object> = getDefaultContext();
    const import_size: Location = { module: false, name: 'size' };
    map.push({
      kind: 'constant_definition',
      subkind: 'local',
      dependencies: [],
      evaluated: true,
      import: import_size,
      root: literal_card('100.0', SoundType.Float),
      value: {
        type: SoundType.Float,
        value: {
          expression: '100.0',
          imports: [],
        },
      },
    });

    const arg_map: Map<string, TamaroCard<[], object>> = new Map();
    arg_map.set('width', {
      kind: 'constant_use',
      import: import_size,
      metadata: {},
    });
    arg_map.set('height', {
      kind: 'constant_use',
      import: import_size,
      metadata: {},
    });
    arg_map.set('color', {
      kind: 'constant_use',
      import: RED.import,
      metadata: {},
    });

    expect(
      await evaluate_tree(
        {
          kind: 'function_use',
          children: arg_map,
          import: RECTANGLE.import,
          metadata: {},
        },
        map,
      ).then((v) => v.value),
    ).to.deep.eq({
      type: SoundType.Graphic,
      value: {
        expression: 'rectangle(size, size, red)',
        imports: [RECTANGLE.import, import_size, RED.import].sort(
          compareLocation,
        ),
      },
    });
  });

  it('evaluate_local_constant_use_inside_function_use_runtime_error', async () => {
    const map: EvaluatedContext<object> = getDefaultContext();
    const import_size: Location = { module: false, name: 'size' };
    map.push({
      kind: 'constant_definition',
      subkind: 'local',
      dependencies: [],
      evaluated: true,
      import: import_size,
      root: literal_card('-100.0', SoundType.Float),
      value: {
        type: SoundType.Float,
        value: {
          expression: '-100.0',
          imports: [],
        },
      },
    });

    const arg_map: Map<string, TamaroCard<[], object>> = new Map();
    arg_map.set('width', {
      kind: 'constant_use',
      import: import_size,
      metadata: {},
    });
    arg_map.set('height', {
      kind: 'constant_use',
      import: import_size,
      metadata: {},
    });
    arg_map.set('color', {
      kind: 'constant_use',
      import: RED.import,
      metadata: {},
    });

    expect(
      await evaluate_tree(
        {
          kind: 'function_use',
          children: arg_map,
          import: RECTANGLE.import,
          metadata: {},
        },
        map,
      ).then((v) => v.value),
    ).to.deep.eq({
      type: UnsoundType.Bottom,
      error: TideRuntimeError_builder('Invalid length for parameter `width`'),
    });
  });
});
