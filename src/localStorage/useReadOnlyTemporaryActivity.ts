import { ActivityVariant } from '../schemas/activitySchema';
import { CodeCellState } from './schema';
import useTemporaryActivity from './useTemporaryActivity';

export default function useReadOnlyTemporaryActivity(
  codeCells: CodeCellState[],
  activityVariant: ActivityVariant,
) {
  return useTemporaryActivity(
    codeCells,
    codeCells,
    () => {},
    activityVariant,
  );
}
