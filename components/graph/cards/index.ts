import { NodeProps, NodeTypes } from '@xyflow/react';
import { JudiciousElement } from '../../../src/schemas/documentation';
import { TamaroFunctionCard } from './function';
import { TamaroCard } from '../../TamaroCard';
import { TamaroLiteralCard } from './literal';

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
} as const;

export type CardType = keyof typeof node_types;
