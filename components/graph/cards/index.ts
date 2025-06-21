import { NodeProps } from '@xyflow/react';
import { TamaroFunctionCard } from './function';
import { TamaroLiteralCard } from './literal';
import { TamaroConstantCard } from './constant';

export interface ImportReference {
  module: string;
  name: string;
}

export type CodeRepresentation = {
  imports: ImportReference[];
  expression: string;
};

export interface ITamaroCardData {
  value: unknown;
  representation?: CodeRepresentation;
}

export interface IImportedCardData extends ITamaroCardData {
  module: string;
  name: string;
}

export const node_types = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function: (props: NodeProps) => TamaroFunctionCard(props as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  literal: (props: NodeProps) => TamaroLiteralCard(props as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constant: (props: NodeProps) => TamaroConstantCard(props as any),
} as const;

export type CardType = keyof typeof node_types;
