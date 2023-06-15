import useLocalStorageState from 'use-local-storage-state';
import { ActivityVariant, activityVariantId } from '../schemas/activitySchema';
import {
  CodeCellState,
  getActivityVariantCodeCellsKey,
} from './schema';
import { useActivity } from './useActivity';
import useLocalProfile from './useLocalProfile';

export default function useLocalActivity(
  initialCodeCells: CodeCellState[],
  activityVariant: ActivityVariant,
) {
  const { metadata, setMetadata } = useLocalProfile();
  const variantId = activityVariantId(activityVariant);
  const variantMetadata = metadata.activities.find((a) => a.id === variantId);
  const [codeCells, setCodeCells] = useLocalStorageState(
    variantMetadata?.codeCellsKey || getActivityVariantCodeCellsKey(variantId),
    { defaultValue: initialCodeCells },
  );
  const activity = useActivity(
    initialCodeCells,
    codeCells,
    setCodeCells,
    metadata,
    setMetadata,
    activityVariant,
  );
  const localCodeCellsWrongLength = codeCells.length !== initialCodeCells.length;
  return {
    ...activity,
    localCodeCellsWrongLength,
  };
}
