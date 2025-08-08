import { Dimensions, Node, NodeProps } from '@xyflow/react';
import { TideFunctionuse } from './function';
import { TideLiteral } from './literal';
import { JudiciousElement } from '../../../src/schemas/documentation';
import TideConstantDefinition from './constant_definition';
import { TideConstantUse } from './constant_use';
import {
  TamaroCard,
  TamaroCard_ConstantUse,
  TamaroCard_FunctionUse,
  TamaroCard_Literal,
} from '../../../src/tide/language/cards';
import TamaroWrapper from './wrapper';
import { LocalConstantDefinition } from '../../../src/tide/language/definitions';

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
export type CommonNodeData = {
  parent?: string;
  outdated?: true;
};
export type TideNodeMetadata = { node_id: string };

export type FunctionNode = Node<
  CommonNodeData & { input: string } & {
    tide_node?: Omit<TamaroCard_FunctionUse<TideNodeMetadata>, 'children'>;
  },
  'function'
>;

export type LiteralNode = Node<
  CommonNodeData & { input: string } & {
    tide_node?: TamaroCard_Literal<TideNodeMetadata>;
  },
  'literal'
>;

export type ConstantNode = Node<
  CommonNodeData & { input: string } & {
    tide_node?: TamaroCard_ConstantUse<TideNodeMetadata>;
  },
  'constant'
>;

export type ConstantDefinitionNode = Node<
  CommonNodeData & { input: string } & {
    text_width?: number;
    min_height?: number;
    dimensions?: Dimensions;
  } & {
    tide_node?: LocalConstantDefinition<TideNodeMetadata, TideNodeMetadata>;
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
      el: TideFunctionuse({ ...props, show_handles: true }),
    }),
  literal: (props: NodeProps<LiteralNode>) =>
    TamaroWrapper({
      nodeprops: props,
      el: TideLiteral({ ...props, show_handles: true }),
    }),
  constant_definition: (props: NodeProps<ConstantDefinitionNode>) =>
    TamaroWrapper({
      nodeprops: props,
      el: TideConstantDefinition({ ...props, show_handles: true }),
    }),
  constant: (props: NodeProps<ConstantNode>) =>
    TamaroWrapper({
      nodeprops: props,
      el: TideConstantUse({ ...props, show_handles: true }),
    }),
} as const;

export const CardKeys = Object.keys(node_types);
export type CardType = keyof typeof node_types;
