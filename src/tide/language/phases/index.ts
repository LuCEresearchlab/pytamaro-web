/* eslint-disable @typescript-eslint/no-explicit-any */
import { TamaroCard } from '../cards';
import { ImportedDefinition, LocalDefinition } from '../definitions';
import {
  TideSyntaxError,
  TideNameError,
  TideTypeError,
  TideRuntimeError,
} from '../errors';
import { EmptyObject, Expand, Merge, WrapNonObject } from '../types';

type Invert<
  T extends Record<string, string | number | symbol | undefined | never>,
> = {
  [K in keyof T as T[K] extends string | number | symbol ? T[K] : never]: K;
};

export type StateToPhase = {
  unconstructed: never;
  constructed: 'construction';
  syntax_checked: 'syntax';
  name_checked: 'name';
  type_checked: 'typecheck';
  code_created: 'code';
  evaluated: 'evaluation';
};

export type State = Expand<keyof StateToPhase>;
export type Phase = Expand<StateToPhase[State]>;

export type PhaseToState = Invert<StateToPhase>;

export type PreviousStateDef = {
  unconstructed: never;
  constructed: 'unconstructed';
  syntax_checked: 'constructed';
  name_checked: 'syntax_checked';
  type_checked: 'name_checked';
  code_created: 'type_checked';
  evaluated: 'code_created';
};

export type NextStateDef = Invert<PreviousStateDef>;

type _PrecedingStates<P extends State> = P extends keyof PreviousStateDef
  ? _PrecedingStates<PreviousStateDef[P]> | P
  : P;

type _SucceedingStates<P extends State> = P extends keyof NextStateDef
  ? _SucceedingStates<NextStateDef[P]> | P
  : P;

export type PreviousStates = {
  [K in State]: _PrecedingStates<K>;
};

export type NextPhases = {
  [K in State]: _SucceedingStates<K>;
};

export type Attachment<T extends Partial<Record<State, any>>> = {
  [K in State]: K extends keyof T ? T[K] : EmptyObject;
};

export type AttachmentUnion<
  T extends Attachment<any>,
  U extends Attachment<any>,
> = Attachment<{
  [k in State]: T[k] | U[k];
}>;

type _MergeWithPrecedingStates<
  P extends State,
  U extends Attachment<any>,
> = P extends keyof PreviousStateDef
  ? PreviousStateDef[P] extends never
    ? WrapNonObject<U[P]>
    : Merge<U[P], _MergeWithPrecedingStates<PreviousStateDef[P], U>>
  : WrapNonObject<U[P]>;

type _MergeWithSucceedingStates<
  P extends State,
  U extends Attachment<any>,
> = P extends keyof NextStateDef
  ? NextStateDef[P] extends never
    ? WrapNonObject<U[P]>
    : Merge<U[P], _MergeWithSucceedingStates<NextStateDef[P], U>>
  : WrapNonObject<U[P]>;

export type MergeWithPrecedingStates<U extends Attachment<any>> = {
  [K in State]: _MergeWithPrecedingStates<K, U>;
};

export type MergeWithSucceedingStates<U extends Attachment<any>> = {
  [K in State]: _MergeWithSucceedingStates<K, U>;
};

export type UnionWithPrecedingStates<U extends Attachment<any>> = {
  [K in State]: {
    [o in PreviousStates[K]]: keyof U[o] extends never ? never : U[o];
  }[PreviousStates[K]];
};

export type UnionWithSucceedingStates<U extends Attachment<any>> = {
  [K in State]: U[NextPhases[K]];
};

export type ErrorAttachment = UnionWithPrecedingStates<
  Attachment<{
    syntax_checked: { type: TideSyntaxError; error_phase: 'syntax_checked' };
    name_checked: { type: TideNameError; error_phase: 'name_checked' };
    type_checked: { type: TideTypeError; error_phase: 'type_checked' };
    evaluated: { type: TideRuntimeError; error_phase: 'evaluated' };
  }>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StuckAttachment<U extends Attachment<any>> = AttachmentUnion<
  U,
  ErrorAttachment
>;

export type TideAttachment<
  T extends Attachment<any> | Partial<Record<State, any>>,
> = StuckAttachment<MergeWithPrecedingStates<Attachment<T>>>;

export abstract class StateConstructor<
  U,
  T,
  Base extends Exclude<State, 'evaluated'>,
> {
  abstract imported_definitions(): ImportedDefinition<T>[];

  abstract definition_phase(
    v: LocalDefinition<Base>,
  ): LocalDefinition<NextStateDef[Base]>;

  abstract expression_phase(
    v: TamaroCard<U, Base>,
  ): TamaroCard<U, NextStateDef[Base]>;
}
