import {
  TamaroCard,
  NonEvaluatedTamaroCard_Literal,
} from '../../src/tide/cards';
import { EvaluatedContext } from '../../src/tide/context';
import { evaluate_tree } from '../../src/tide/evaluation';
import {
  compareLocation,
  Location,
  SoundType,
} from '../../src/tide/expression';
import { getDefaultContext, RECTANGLE, RED } from './data';

function literal_card(
  value: string,
  type: SoundType.Float | SoundType.Str | SoundType.Bool,
): NonEvaluatedTamaroCard_Literal<{}> {
  return {
    kind: 'literal',
    str_value: value,
    metadata: {},
    type,
  };
}

test('evaluate_literal_float', () => {
  expect(evaluate_tree(literal_card('1.0', SoundType.Float), [])).toMatchObject(
    {
      type: SoundType.Float,
      value: {
        type: SoundType.Float,
        value: { expression: '1.0', imports: [] },
      },
    },
  );
});

test('evaluate_literal_str', () => {
  expect(
    evaluate_tree(literal_card('"Hello World !"', SoundType.Str), []),
  ).toMatchObject({
    type: SoundType.Str,
    value: {
      type: SoundType.Str,
      value: { expression: '"Hello World !"', imports: [] },
    },
  });
});

test('evaluate_literal_bool', () => {
  expect(evaluate_tree(literal_card('True', SoundType.Bool), [])).toMatchObject(
    {
      type: SoundType.Bool,
      value: {
        type: SoundType.Bool,
        value: { expression: 'True', imports: [] },
      },
    },
  );
});

test('evaluate_imported_constant_use', () => {
  const map: EvaluatedContext<{}> = getDefaultContext();

  expect(
    evaluate_tree(
      { kind: 'constant_use', import: RED.import, metadata: {} },
      map,
    ),
  ).toMatchObject({
    value: {
      type: SoundType.Color,
      value: {
        expression: RED.import.name,
        imports: [RED.import],
      },
    },
  });
});

test('evaluate_local_constant_use', () => {
  const map: EvaluatedContext<{}> = [];
  const import_size: Location = { module: false, name: 'size' };
  map.push({
    kind: 'constant_definition',
    subkind: 'local',
    dependencies: [],
    evaluated: true,
    evaluated_type: SoundType.Float,
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
    evaluate_tree(
      { kind: 'constant_use', import: import_size, metadata: {} },
      map,
    ),
  ).toMatchObject({
    value: {
      type: SoundType.Float,
      value: {
        expression: import_size.name,
        imports: [import_size],
      },
    },
  });
});

test('simple_evaluate_function_use', () => {
  const map: EvaluatedContext<{}> = getDefaultContext();

  const arg_map: Map<string, TamaroCard<[], {}>> = new Map();
  arg_map.set('width', literal_card('100.0', SoundType.Float));
  arg_map.set('height', literal_card('100.0', SoundType.Float));
  arg_map.set('color', {
    kind: 'constant_use',
    import: RED.import,
    metadata: {},
  });

  expect(
    evaluate_tree(
      {
        kind: 'function_use',
        children: arg_map,
        import: RECTANGLE.import,
        metadata: {},
      },
      map,
    ),
  ).toMatchObject({
    value: {
      type: SoundType.Graphic,
      value: {
        expression: 'rectangle(100.0, 100.0, red)',
        imports: [RECTANGLE.import, RED.import].sort(compareLocation),
      },
    },
  });
});

test('evaluate_local_constant_use_inside_function_use', () => {
  const map: EvaluatedContext<{}> = getDefaultContext();
  const import_size: Location = { module: false, name: 'size' };
  map.push({
    kind: 'constant_definition',
    subkind: 'local',
    dependencies: [],
    evaluated: true,
    evaluated_type: SoundType.Float,
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

  const arg_map: Map<string, TamaroCard<[], {}>> = new Map();
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
    evaluate_tree(
      {
        kind: 'function_use',
        children: arg_map,
        import: RECTANGLE.import,
        metadata: {},
      },
      map,
    ),
  ).toMatchObject({
    value: {
      type: SoundType.Graphic,
      value: {
        expression: 'rectangle(size, size, red)',
        imports: [RECTANGLE.import, import_size, RED.import].sort(
          compareLocation,
        ),
      },
    },
  });
});
