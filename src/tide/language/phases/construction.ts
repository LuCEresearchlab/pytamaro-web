import { Phase } from '.';

export type ConstructionPhase<U, Tlocal, Timport> = Phase<
  U,
  Tlocal,
  Timport,
  'unconstructed'
>;
