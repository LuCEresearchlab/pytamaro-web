import { Dispatch, SetStateAction, useState } from 'react';
import { ExecutionResponse } from '../codeExecution';
import { ActivityVariant } from '../schemas/activitySchema';
import {
  CodeCellState, ToolboxFunction,
} from './schema';
import { useActivity } from './useActivity';
import useLocalProfile from './useLocalProfile';

export default function useTemporaryActivity(
  initialCodeCells: CodeCellState[],
  codeCells: CodeCellState[],
  setCodeCells: Dispatch<SetStateAction<CodeCellState[]>>,
  activityVariant: ActivityVariant,
  preExecute: () => ToolboxFunction | undefined = () => undefined,
  postExecuteSingleCell:
  (idx: number, response: ExecutionResponse | undefined) => void = () => undefined,
) {
  const { metadata } = useLocalProfile();
  const [temporaryMetadata, setTemporaryMetadata] = useState(metadata);
  return useActivity(
    initialCodeCells,
    codeCells,
    setCodeCells,
    temporaryMetadata,
    setTemporaryMetadata,
    activityVariant,
    [],
    preExecute,
    postExecuteSingleCell,
  );
}
