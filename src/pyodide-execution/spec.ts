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
  foreground: GraphicSpec;
  background: GraphicSpec;
  foreground_pin?: Point;
  background_pin?: Point;
  type: 'Compose';
};

export type PinSpec = {
  pinning_point: Point;
  graphic: GraphicSpec;
  type: 'Pin';
};

export type RotateSpec = {
  angle: number;
  graphic: GraphicSpec;
  type: 'Rotate';
};

export type GraphicSpec =
  | EmptySpec
  | RectangleSpec
  | EllipseSpec
  | CircularSectorSpec
  | TriangleSpec
  | TextSpec
  | ComposeSpec
  | PinSpec
  | RotateSpec;
