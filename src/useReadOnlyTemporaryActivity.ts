import { CodeCellState } from './localStorage/schema';
import { ActivityVariant } from './schemas/activitySchema';
import useTemporaryActivity from './useTemporaryActivity';

export default function useReadOnlyTemporaryActivity(
  codeCells: CodeCellState[],
  activityVariant: ActivityVariant,
) {
  return useTemporaryActivity(codeCells, codeCells, () => {}, activityVariant);
}
