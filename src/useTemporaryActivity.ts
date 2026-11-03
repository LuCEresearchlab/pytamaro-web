import { useState } from 'react';
import useActivitySession from './activitySession';
import type { ExecutionResponse } from './execution/codeExecution';
import type { CodeCellState, ToolboxFunction } from './localStorage/schema';
import useLocalProfile from './localStorage/useLocalProfile';
import type { ActivityVariant } from './schemas/activitySchema';
import { useActivity } from './useActivity';

export default function useTemporaryActivity(
  initialCodeCells: CodeCellState[],
  activityVariant: ActivityVariant,
  extraToolboxFunctions?: ToolboxFunction[],
  postExecuteSingleCell: (
    idx: number,
    response: ExecutionResponse | undefined,
  ) => void = () => undefined,
) {
  const { metadata } = useLocalProfile();
  const [temporaryMetadata, setTemporaryMetadata] = useState(metadata);
  const activitySession = useActivitySession(
    initialCodeCells,
    undefined,
    undefined,
    extraToolboxFunctions,
  );
  return useActivity(
    activitySession,
    temporaryMetadata,
    setTemporaryMetadata,
    activityVariant,
    [],
    postExecuteSingleCell,
  );
}
