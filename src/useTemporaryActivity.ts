import { Dispatch, SetStateAction, useState } from 'react';
import { ExecutionResponse } from './execution/codeExecution';
import { CodeCellState, ToolboxFunction } from './localStorage/schema';
import useLocalProfile from './localStorage/useLocalProfile';
import { ActivityVariant } from './schemas/activitySchema';
import { useActivity } from './useActivity';

export default function useTemporaryActivity(
  initialCodeCells: CodeCellState[],
  codeCells: CodeCellState[],
  setCodeCells: Dispatch<SetStateAction<CodeCellState[]>>,
  activityVariant: ActivityVariant,
  getExtraToolboxFunction: () => ToolboxFunction | undefined = () => undefined,
  postExecuteSingleCell: (
    idx: number,
    response: ExecutionResponse | undefined,
  ) => void = () => undefined,
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
    getExtraToolboxFunction,
    postExecuteSingleCell,
  );
}
