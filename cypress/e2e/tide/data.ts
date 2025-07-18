import { FunctionParameter } from '../../../src/tide/language/cards';
import { EvaluatedDefinition } from '../../../src/tide/language/context';
import { Location, SoundType } from '../../../src/tide/language/expression';

const context = new Map<Location, EvaluatedDefinition<object>>();

function register(def: EvaluatedDefinition<object>) {
  context.set(def.import, def);
  return def;
}

function constant_use(name: string, type: SoundType) {
  const i: Location = { module: 'pytamaro', name };
  return register({
    kind: 'constant_definition',
    dependencies: [],
    import: i,
    evaluated: true,
    evaluated_type: type,
    subkind: 'imported',
  });
}

function function_use(
  name: string,
  type: SoundType,
  params: { [key: string]: SoundType },
) {
  const i = { module: 'pytamaro', name };
  const _params = Object.entries(params).map(
    (v) => ({ name: v[0], type: v[1] }) as FunctionParameter,
  );

  return register({
    kind: 'function_definition',
    subkind: 'imported',
    dependencies: [],
    evaluated: true,
    return_type: type,
    import: i,
    parameters: _params,
  });
}

function graphic_function_use(
  name: string,
  params: { [key: string]: SoundType },
) {
  return function_use(name, SoundType.Graphic, params);
}

// Color constants
export const BLACK = constant_use('black', SoundType.Color);
export const BLUE = constant_use('blue', SoundType.Color);
export const CYAN = constant_use('cyan', SoundType.Color);
export const GREEN = constant_use('green', SoundType.Color);
export const MAGENTA = constant_use('magenta', SoundType.Color);
export const RED = constant_use('red', SoundType.Color);
export const TRANSPARENT = constant_use('transparent', SoundType.Color);
export const WHITE = constant_use('white', SoundType.Color);
export const YELLOW = constant_use('yellow', SoundType.Color);

// Point constants
export const TOP_LEFT = constant_use('top_left', SoundType.Point);
export const TOP_CENTER = constant_use('top_center', SoundType.Point);
export const TOP_RIGHT = constant_use('top_right', SoundType.Point);
export const CENTER_LEFT = constant_use('center_left', SoundType.Point);
export const CENTER = constant_use('center', SoundType.Point);
export const CENTER_RIGHT = constant_use('center_right', SoundType.Point);
export const BOTTOM_LEFT = constant_use('bottom_left', SoundType.Point);
export const BOTTOM_CENTER = constant_use('bottom_center', SoundType.Point);
export const BOTTOM_RIGHT = constant_use('bottom_right', SoundType.Point);

// Primitive functions
export const CIRCULAR_SECTOR = graphic_function_use('circular_sector', {
  radius: SoundType.Float,
  angle: SoundType.Float,
  color: SoundType.Color,
});

export const ELLIPSE = graphic_function_use('ellipse', {
  width: SoundType.Float,
  height: SoundType.Float,
  color: SoundType.Color,
});

export const EMPTY_GRAPHIC = graphic_function_use('empty_graphic', {});

export const RECTANGLE = graphic_function_use('rectangle', {
  width: SoundType.Float,
  height: SoundType.Float,
  color: SoundType.Color,
});

export const TEXT = graphic_function_use('text', {
  content: SoundType.Str,
  font: SoundType.Str,
  points: SoundType.Float,
  color: SoundType.Color,
});

export const TRIANGLE = graphic_function_use('triangle', {
  side1: SoundType.Float,
  side2: SoundType.Float,
  angle: SoundType.Float,
  color: SoundType.Color,
});

// Composition functions

export const ABOVE = graphic_function_use('above', {
  top_graphic: SoundType.Graphic,
  bottom_graphic: SoundType.Graphic,
});

export const BESIDE = graphic_function_use('beside', {
  left_graphic: SoundType.Graphic,
  right_graphic: SoundType.Graphic,
});

export const COMPOSE = graphic_function_use('compose', {
  foreground_graphic: SoundType.Graphic,
  background_graphic: SoundType.Graphic,
});

export const GRAPHIC_HEIGHT = function_use('graphic_height', SoundType.Float, {
  graphic: SoundType.Graphic,
});

export const GRAPHIC_WIDTH = function_use('graphic_width', SoundType.Float, {
  graphic: SoundType.Graphic,
});

export const OVERLAY = graphic_function_use('overlay', {
  foreground_graphic: SoundType.Graphic,
  background_graphic: SoundType.Graphic,
});

export const PIN = graphic_function_use('ping', {
  point: SoundType.Point,
  graphic: SoundType.Graphic,
});

export const ROTATE = graphic_function_use('rotate', {
  angle: SoundType.Float,
  graphic: SoundType.Graphic,
});

export const HSL_COLOR = function_use('hsl_color', SoundType.Color, {
  hue: SoundType.Float,
  saturation: SoundType.Float,
  lightness: SoundType.Float,
});

export const HSV_COLOR = function_use('hsv_color', SoundType.Color, {
  hue: SoundType.Float,
  saturation: SoundType.Float,
  value: SoundType.Float,
});

export const RGB_COLOR = function_use('rgb_color', SoundType.Color, {
  red: SoundType.Float,
  green: SoundType.Float,
  blue: SoundType.Float,
});

export function getDefaultContext() {
  return Array.from(context.values());
}
