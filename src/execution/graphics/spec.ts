export type EncodedColor = number | bigint;

export type EncodedPoint = number | bigint;

type Colored = {
  color: EncodedColor;
};

export type Point = {
  x: number;
  y: number;
};

export type Sized = {
  width: number;
  height: number;
};

/* Graphics */

export type EmptySpec = {
  t: 'Empty';
};

export type RectangleSpec = Colored &
  Sized & {
    t: 'Rectangle';
  };

export type EllipseSpec = Colored &
  Sized & {
    t: 'Ellipse';
  };

export type CircularSectorSpec = Colored & {
  radius: number;
  angle: number;
  t: 'CircularSector';
};

export type TriangleSpec = Colored & {
  side1: number;
  side2: number;
  angle: number;
  t: 'Triangle';
};

export type TextSpec = Colored & {
  text: string;
  font_name: string;
  text_size: number;
  t: 'Text';
};

export type ComposeSpec = {
  fg_pin?: EncodedPoint;
  bg_pin?: EncodedPoint;
  pin?: EncodedPoint;
  t: 'Compose';
};

export type PinSpec = {
  pin: EncodedPoint;
  t: 'Pin';
};

export type RotateSpec = {
  angle: number;
  t: 'Rotate';
};

type PrimitiveSpec =
  | RectangleSpec
  | EllipseSpec
  | CircularSectorSpec
  | TriangleSpec
  | TextSpec;

export type GraphicSpec =
  | EmptySpec
  | PrimitiveSpec
  | ComposeSpec
  | PinSpec
  | RotateSpec;
