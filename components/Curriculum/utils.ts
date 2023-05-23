import { Activity } from '../../src/schemas/activitySchema';
import theme from '../../src/theme';

export type ActivityNodeData = {
  id: string;
  activity: Activity;
  isCompleted: boolean;
  isUnlocked: boolean;
  width: number,
  height: number,
};

export function color(highlighted: boolean) {
  return highlighted ? theme.palette.success.main : theme.palette.grey[300];
}
