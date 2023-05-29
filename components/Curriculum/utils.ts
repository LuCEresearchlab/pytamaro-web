import { Activity } from '../../src/schemas/activitySchema';
import { Curriculum } from '../../src/schemas/curriculumSchema';
import theme from '../../src/theme';

export type ActivityNodeData = {
  id: string;
  activity: Activity;
  curriculum: Curriculum;
  isCompleted: boolean;
  isUnlocked: boolean;
  width: number,
  height: number,
};

export function color(highlighted: boolean) {
  return highlighted ? theme.palette.primary.main : '#ADD8E6';
}
