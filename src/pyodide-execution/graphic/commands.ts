import {
  EmbindObject,
  InputMatrix,
  Paint,
  Path,
} from '../../canvaskit-wasm/canvaskit';
import { Point } from '../spec';

export type Command =
  | { type: 'BEGIN'; path: Path; pinPosition: Point }
  | { type: 'END'; toDelete?: EmbindObject<string>[] }
  | { type: 'DRAW'; path: Path; paint: Paint }
  | { type: 'SAVE' }
  | { type: 'RESTORE' }
  | { type: 'TRANSLATE'; dx: number; dy: number }
  | { type: 'TRANSFORM'; matrix: InputMatrix };
