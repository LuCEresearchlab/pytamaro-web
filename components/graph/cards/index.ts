import { NodeProps } from '@xyflow/react';
import { TamaroFunctionCard } from './function';
import { TamaroLiteralCard } from './literal';
import { TamaroConstantCard } from './constant';

export class Wrap<T> {
  obj: T | undefined;

  constructor(_obj?: T) {
    this.obj = _obj;
  }
}

export interface ITamaroCardData {
  wrap: Wrap<any>;
}

export interface IImportedCardData extends ITamaroCardData {
  module: string;
  name: string;
}

export const node_types = {
  function: (props: NodeProps) => TamaroFunctionCard(props as any),
  literal: (props: NodeProps) => TamaroLiteralCard(props as any),
  constant: (props: NodeProps) => TamaroConstantCard(props as any),
} as const;

export type CardType = keyof typeof node_types;
