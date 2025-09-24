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
  type: 'empty';
};

export type RectangleSpec = Colored &
  Sized & {
    type: 'rectangle';
  };

export type EllipseSpec = Colored &
  Sized & {
    type: 'ellipse';
  };

export type CircularSectorSpec = Colored & {
  radius: number;
  angle: number;
  type: 'circularSector';
};

export type TriangleSpec = Colored & {
  side1: number;
  side2: number;
  angle: number;
  type: 'triangle';
};

export type TextSpec = Colored & {
  text: string;
  font_name: string;
  text_size: number;
  type: 'text';
};

export type ComposeSpec = {
  foreground: GraphicSpec;
  background: GraphicSpec;
  type: 'compose';
};

export type PinSpec = {
  pinPoint: Point;
  graphic: GraphicSpec;
  type: 'pin';
};

export type RotateSpec = {
  angle: number;
  graphic: GraphicSpec;
  type: 'rotate';
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
