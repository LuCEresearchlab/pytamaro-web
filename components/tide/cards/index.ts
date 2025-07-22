import { Dimensions, Node, NodeProps } from '@xyflow/react';
import { TamaroFunctionCard } from './function';
import { TamaroLiteralCard } from './literal';
import { JudiciousElement } from '../../../src/schemas/documentation';
import ConstantDefinition from './constant_definition';
import ConstantUse from './constant_use';
import {
  TamaroCard,
  TamaroCard_ConstantUse,
  TamaroCard_FunctionUse,
  TamaroCard_Literal,
} from '../../../src/tide/language/cards';
import { LocalConstantDefinition } from '../../../src/tide/language/definitions';
import TamaroWrapper from './wrapper';

export interface ImportReference {
  module: string;
  name: string;
}

export type CodeRepresentation = {
  imports: ImportReference[];
  definition?: string;
  expression: string;
};

export interface ITamaroCardData {
  value: unknown;
  representation?: CodeRepresentation;
}

export interface IImportedCardData extends ITamaroCardData {
  module: string;
  name: string;
  value: JudiciousElement;
}

export type ExtraneousNodeProps = { show_handles?: boolean };
export type CommonNodeData = { parent?: string };
export type TideNodeMetadata = { node_id: string };

export type FunctionNode = Node<
  TamaroCard_FunctionUse<TideNodeMetadata> & CommonNodeData,
  'function'
>;

export type LiteralNode = Node<
  TamaroCard_Literal<TideNodeMetadata> & CommonNodeData,
  'literal'
>;

export type ConstantNode = Node<
  TamaroCard_ConstantUse<TideNodeMetadata> & CommonNodeData,
  'constant'
>;

export type ConstantDefinitionNode = Node<
  LocalConstantDefinition<TideNodeMetadata> &
    CommonNodeData & {
      text_width?: number;
      min_height?: number;
      dimensions?: Dimensions;
    },
  'constant_definition'
>;

export type TideTamaroCard = TamaroCard<TideNodeMetadata>;
export type TamaroCardNode = FunctionNode | LiteralNode | ConstantNode;

export type TideNode = TamaroCardNode | ConstantDefinitionNode;

export const node_types = {
  function: (props: NodeProps<FunctionNode>) =>
    TamaroWrapper({
      nodeprops: props,
      el: TamaroFunctionCard({ ...props, show_handles: true }),
    }),
  literal: (props: NodeProps<LiteralNode>) =>
    TamaroWrapper({
      nodeprops: props,
      el: TamaroLiteralCard({ ...props, show_handles: true }),
    }),
  constant_definition: (props: NodeProps<ConstantDefinitionNode>) =>
    TamaroWrapper({
      nodeprops: props,
      el: ConstantDefinition({ ...props, show_handles: true }),
    }),
  constant: (props: NodeProps<ConstantNode>) =>
    TamaroWrapper({
      nodeprops: props,
      el: ConstantUse({ ...props, show_handles: true }),
    }),
} as const;

export const CardKeys = Object.keys(node_types);
export type CardType = keyof typeof node_types;
