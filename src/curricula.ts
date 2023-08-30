import { isEqual } from 'lodash';
import { allActivities } from './curriculumCompetencies';
import { ActivityVariant } from './schemas/activitySchema';
import { Curriculum } from './schemas/curriculumSchema';

export default function visibleCurricula(curricula: Curriculum[]) : Curriculum[] {
  return curricula.filter((curriculum) => curriculum.visibility !== 'hidden');
}

export function findIncludingCurricula(curricula: Curriculum[], activityVariant: ActivityVariant) {
  return visibleCurricula(curricula).filter(
    (curriculum) => allActivities(curriculum).some(
      (activity) => isEqual(activity.variant, activityVariant),
    ),
  );
}
