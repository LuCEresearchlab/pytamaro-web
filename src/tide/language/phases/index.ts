/* eslint-disable @typescript-eslint/no-explicit-any */
import { Attachment } from '@mui/icons-material';
import { TamaroCard } from '../cards';
import { ImportedDefinition, LocalDefinition } from '../definitions';
import {
  TideSyntaxError,
  TideNameError,
  TideTypeError,
  TideRuntimeError,
  TideError,
} from '../errors';
import { EmptyObject, Identity } from '../types';
import { ErrorType } from '../typing';

type Invert<
  T extends Record<string, string | number | symbol | undefined | never>,
> = {
  [K in keyof T as T[K] extends string | number | symbol ? T[K] : never]: K;
};

export type State =
  | 'unconstructed'
  | 'constructed'
  | 'syntax_checked'
  | 'name_checked'
  | 'type_checked'
  | 'code_created'
  | 'evaluated';

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
  never: never;
} & {
  [K in State]: _PrecedingStates<K>;
};

export type NextStates = {
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

export type UnionWithPrecedingStates<U extends Partial<Record<State, any>>> = {
  [K in State]: {
    [o in PreviousStates[K] & keyof U]: U[o];
  }[PreviousStates[K] & keyof U];
};

export type IntersectionWithPrecedingStates<
  U extends Attachment<any> | Partial<Record<State, any>>,
> = {
  unconstructed: U['unconstructed'];
  constructed: U['unconstructed'] & U['constructed'];
  syntax_checked: U['unconstructed'] & U['constructed'] & U['syntax_checked'];

  name_checked: U['unconstructed'] &
    U['constructed'] &
    U['syntax_checked'] &
    U['name_checked'];

  type_checked: U['unconstructed'] &
    U['constructed'] &
    U['syntax_checked'] &
    U['name_checked'] &
    U['type_checked'];

  code_created: U['unconstructed'] &
    U['constructed'] &
    U['syntax_checked'] &
    U['name_checked'] &
    U['type_checked'] &
    U['code_created'];

  evaluated: U['unconstructed'] &
    U['constructed'] &
    U['syntax_checked'] &
    U['name_checked'] &
    U['type_checked'] &
    U['code_created'] &
    U['evaluated'];
};

type _TideError = TideError;

type StateErrorAttachment<
  T extends Partial<Record<State, any>>,
  U extends _TideError,
  Base extends State,
> = T[PreviousStateDef[Base]] &
  (U extends Exclude<_TideError, TideRuntimeError>
    ? {
        type: ErrorType | false;
        error_phase: Base;
      }
    : {
        value: U | false;
        error_phase: Base;
      });

type _StateErrorAttachment<
  T extends Partial<Record<State, any>>,
  U extends _TideError,
  Base extends State,
> = StateErrorAttachment<T, U, Base>;

type _TideSyntaxError = TideSyntaxError;

export type ErrorAttachment<T extends Partial<Record<State, any>>> =
  UnionWithPrecedingStates<{
    syntax_checked: _StateErrorAttachment<
      T,
      Identity<_TideSyntaxError>,
      'syntax_checked'
    >;

    name_checked: _StateErrorAttachment<T, TideNameError, 'name_checked'>;

    type_checked: _StateErrorAttachment<T, TideTypeError, 'type_checked'>;

    evaluated: _StateErrorAttachment<T, TideRuntimeError, 'evaluated'>;
  }>;

export type TideAttachment<
  T extends Attachment<any> | Partial<Record<State, any>>,
> = {
  [k in State]: Attachment<T>[k] | ErrorAttachment<Attachment<T>>[k];
};

export type ProgramState<U, Tlocal, Timport, S extends State> = {
  imported_definitions: ImportedDefinition<Timport, S>[];
  local_definitions: LocalDefinition<U, Tlocal, S>[];
  expressions: TamaroCard<U, S>[];
};

export type Phase<
  U,
  Tlocal,
  Timport,
  Base extends Exclude<State, 'evaluated'>,
> = (
  base: ProgramState<U, Tlocal, Timport, Base>,
) => ProgramState<U, Tlocal, Timport, NextStateDef[Base]>;
