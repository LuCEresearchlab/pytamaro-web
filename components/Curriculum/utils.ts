import { Activity } from '../../src/schemas/activitySchema';
import { Curriculum } from '../../src/schemas/curriculumSchema';
import theme from '../../src/theme';
import { ActivityStatus } from '../ActivityStatusBadge';

export type ActivityNodeData = {
  id: string;
  activity: Activity;
  curriculum: Curriculum;
  status: ActivityStatus;
  isUnlocked: boolean;
  width: number,
  height: number,
};

export function color(highlighted: boolean) {
  return highlighted ? theme.palette.primary.main : '#ADD8E6';
}
