import useActivitySession from '../activitySession';
import type { ActivityVariant, PythonFile } from '../schemas/activitySchema';
import { activityVariantId } from '../schemas/activitySchema';
import { useActivity } from '../useActivity';
import type { CodeCellState } from './schema';
import { getActivityVariantCodeCellsKey } from './schema';
import useLocalProfile from './useLocalProfile';

export default function useLocalActivity(
  initialCodeCells: CodeCellState[],
  activityVariant: ActivityVariant,
  extraPythonFiles: PythonFile[] = [],
) {
  const { metadata, setMetadata } = useLocalProfile();
  const variantId = activityVariantId(activityVariant);
  const variantMetadata = metadata.activities.find((a) => a.id === variantId);
  const storageKey =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    variantMetadata?.codeCellsKey || getActivityVariantCodeCellsKey(variantId);
  const activitySession = useActivitySession(
    initialCodeCells,
    storageKey,
    extraPythonFiles,
  );

  const activity = useActivity(
    activitySession,
    metadata,
    setMetadata,
    activityVariant,
    extraPythonFiles,
  );
  const localCodeCellsWrongLength =
    activitySession.codeCellsWrongLength() ||
    activity.codeExecutionStates.length !== activity.codeCells.length;
  return {
    ...activity,
    localCodeCellsWrongLength,
  };
}

export type LocalActivityState = ReturnType<typeof useLocalActivity>;
