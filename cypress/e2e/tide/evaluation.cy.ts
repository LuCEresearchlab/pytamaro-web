import {
  EvaluatedTamaroCard_Literal,
  TamaroCard,
  NonEvaluatedTamaroCard_Literal,
} from '../../../src/tide/language/cards';
import { EvaluatedDefinitions } from '../../../src/tide/language/definitions';
import { TideRuntimeError_builder } from '../../../src/tide/language/error_builders';
import { evaluate_tree } from '../../../src/tide/language/evaluation';
import { Location } from '../../../src/tide/language/types';
import { compareLocation } from '../../../src/tide/language/utils';
import { SoundType, UnsoundType } from '../../../src/tide/language/typing';
import { getDefaultContext, RECTANGLE, RED } from './data';

function literal_card(
  value: string,
  type: SoundType.Float | SoundType.Str | SoundType.Bool,
): NonEvaluatedTamaroCard_Literal<object> {
  return {
    kind: 'literal',
    str_value: value,
    metadata: {},
    type,
    evaluated: false,
  };
}

function literal_card_evaluated(
  value: string,
  type: SoundType.Float | SoundType.Str | SoundType.Bool,
): EvaluatedTamaroCard_Literal<object> {
  return {
    ...literal_card(value, type),
    value: {
      data: undefined,
      type,
      value: {
        expression: value,
        imports: [],
      },
    },
    evaluated: true,
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
    const map: EvaluatedDefinitions<object> = getDefaultContext();

    expect(
      await evaluate_tree(
        {
          kind: 'constant_use',
          location: RED.import,
          evaluated: false,
          metadata: {},
        },
        map,
      ),
    ).to.deep.eq({
      ...{ kind: 'constant_use', location: RED.import, metadata: {} },
      evaluated: true,
      value: {
        data: { red: 255, green: 0, blue: 0, alpha: 1 },
        type: SoundType.Color,
        value: {
          expression: RED.location.name,
          imports: [RED.import],
        },
      },
    });
  });

  it('evaluate_local_constant_use', async () => {
    const map: EvaluatedDefinitions<object> = [];
    const import_size: Location = { module: false, name: 'size' };
    map.push({
      kind: 'constant_definition',
      subkind: 'local',
      dependencies: [],
      evaluated: true,
      location: import_size,
      root: literal_card('100.0', SoundType.Float),
      value: {
        data: undefined,
        type: SoundType.Float,
        value: {
          expression: '100.0',
          imports: [],
        },
      },
      metadata: {},
    });

    expect(
      await evaluate_tree(
        {
          kind: 'constant_use',
          location: import_size,
          evaluated: false,
          metadata: {},
        },
        map,
      ),
    ).to.deep.eq({
      ...{ kind: 'constant_use', location: import_size, metadata: {} },
      evaluated: true,
      value: {
        data: undefined,
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
    const map: EvaluatedDefinitions<object> = getDefaultContext();

    const arg_map: Map<string, TamaroCard<object>> = new Map();
    arg_map.set('width', literal_card('100.0', SoundType.Float));
    arg_map.set('height', literal_card('100.0', SoundType.Float));
    arg_map.set('color', {
      kind: 'constant_use',
      location: RED.import,
      metadata: {},
      evaluated: false,
    });

    expect(
      await evaluate_tree(
        {
          kind: 'function_use',
          children: arg_map,
          location: RECTANGLE.import,
          metadata: {},
          evaluated: false,
        },
        map,
      ).then((v) => v.value),
    ).to.deep.eq({
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABAElEQVR4nO3RQQ0AIBDAsAP/nuGNAvZoFSzZOjNnyNi/A3gZEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIzAXsTALGT7m3PwAAAABJRU5ErkJggg==',
      type: SoundType.Graphic,
      value: {
        expression: 'rectangle(100.0, 100.0, red)',
        imports: [RECTANGLE.import, RED.import].sort(compareLocation),
      },
    });
  });

  it('evaluate_local_constant_use_inside_function_use', async () => {
    const map: EvaluatedDefinitions<object> = getDefaultContext();
    const import_size: Location = { module: false, name: 'size' };
    map.push({
      kind: 'constant_definition',
      subkind: 'local',
      dependencies: [],
      evaluated: true,
      location: import_size,
      root: literal_card('100.0', SoundType.Float),
      value: {
        data: undefined,
        type: SoundType.Float,
        value: {
          expression: '100.0',
          imports: [],
        },
      },
      metadata: {},
    });

    const arg_map: Map<string, TamaroCard<object>> = new Map();
    arg_map.set('width', {
      kind: 'constant_use',
      location: import_size,
      metadata: {},
      evaluated: false,
    });
    arg_map.set('height', {
      kind: 'constant_use',
      location: import_size,
      metadata: {},
      evaluated: false,
    });
    arg_map.set('color', {
      kind: 'constant_use',
      location: RED.import,
      metadata: {},
      evaluated: false,
    });

    expect(
      await evaluate_tree(
        {
          kind: 'function_use',
          children: arg_map,
          location: RECTANGLE.import,
          metadata: {},
          evaluated: false,
        },
        map,
      ).then((v) => v.value),
    ).to.deep.eq({
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABAElEQVR4nO3RQQ0AIBDAsAP/nuGNAvZoFSzZOjNnyNi/A3gZEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIjCExhsQYEmNIzAXsTALGT7m3PwAAAABJRU5ErkJggg==',
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
    const map: EvaluatedDefinitions<object> = getDefaultContext();
    const import_size: Location = { module: false, name: 'size' };
    map.push({
      kind: 'constant_definition',
      subkind: 'local',
      dependencies: [],
      evaluated: true,
      location: import_size,
      root: literal_card('-100.0', SoundType.Float),
      value: {
        data: undefined,
        type: SoundType.Float,
        value: {
          expression: '-100.0',
          imports: [],
        },
      },
      metadata: {},
    });

    const arg_map: Map<string, TamaroCard<object>> = new Map();
    arg_map.set('width', {
      kind: 'constant_use',
      location: import_size,
      metadata: {},
      evaluated: false,
    });
    arg_map.set('height', {
      kind: 'constant_use',
      location: import_size,
      metadata: {},
      evaluated: false,
    });
    arg_map.set('color', {
      kind: 'constant_use',
      location: RED.import,
      metadata: {},
      evaluated: false,
    });

    expect(
      await evaluate_tree(
        {
          kind: 'function_use',
          children: arg_map,
          location: RECTANGLE.import,
          metadata: {},
          evaluated: false,
        },
        map,
      ).then((v) => v.value),
    ).to.deep.eq({
      type: UnsoundType.Bottom,
      error: TideRuntimeError_builder('Invalid length for parameter `width`'),
    });
  });

  it('evaluate_local_constant_use_inside_function_use_0x0', async () => {
    const map: EvaluatedDefinitions<object> = getDefaultContext();
    const import_size: Location = { module: false, name: 'size' };
    map.push({
      kind: 'constant_definition',
      subkind: 'local',
      dependencies: [],
      evaluated: true,
      location: import_size,
      root: literal_card('0.0', SoundType.Float),
      value: {
        data: undefined,
        type: SoundType.Float,
        value: {
          expression: '0.0',
          imports: [],
        },
      },
      metadata: {},
    });

    const arg_map: Map<string, TamaroCard<object>> = new Map();
    arg_map.set('width', {
      kind: 'constant_use',
      location: import_size,
      metadata: {},
      evaluated: false,
    });
    arg_map.set('height', {
      kind: 'constant_use',
      location: import_size,
      metadata: {},
      evaluated: false,
    });
    arg_map.set('color', {
      kind: 'constant_use',
      location: RED.import,
      metadata: {},
      evaluated: false,
    });

    expect(
      await evaluate_tree(
        {
          kind: 'function_use',
          children: arg_map,
          location: RECTANGLE.import,
          evaluated: false,
          metadata: {},
        },
        map,
      ).then((v) => v.value),
    ).to.deep.eq({
      data: undefined,
      type: SoundType.Graphic,
      value: {
        expression: 'rectangle(size, size, red)',
        imports: [RECTANGLE.import, import_size, RED.import].sort(
          compareLocation,
        ),
      },
    });
  });
});
