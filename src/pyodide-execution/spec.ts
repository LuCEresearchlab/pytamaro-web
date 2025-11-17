/* Point */

export type Point = {
  x: number;
  y: number;
};

export type Color = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type Colored = {
  color: Color;
};

export type Sized = {
  width: number;
  height: number;
};

/* Graphics */

export type EmptySpec = {
  type: 'Empty';
};

export type RectangleSpec = Colored &
  Sized & {
    type: 'Rectangle';
  };

export type EllipseSpec = Colored &
  Sized & {
    type: 'Ellipse';
  };

export type CircularSectorSpec = Colored & {
  radius: number;
  angle: number;
  type: 'CircularSector';
};

export type TriangleSpec = Colored & {
  side1: number;
  side2: number;
  angle: number;
  type: 'Triangle';
};

export type TextSpec = Colored & {
  text: string;
  font_name: string;
  text_size: number;
  type: 'Text';
};

export type ComposeSpec = {
  foreground_pin?: Point;
  background_pin?: Point;
  own_pin?: Point;
  type: 'Compose';
};

export type PinSpec = {
  pinning_point: Point;
  type: 'Pin';
};

export type RotateSpec = {
  angle: number;
  type: 'Rotate';
};

export type PrimitiveSpec =
  | RectangleSpec
  | EllipseSpec
  | CircularSectorSpec
  | TriangleSpec;

export type GraphicSpec =
  | EmptySpec
  | PrimitiveSpec
  | TextSpec
  | ComposeSpec
  | PinSpec
  | RotateSpec;
