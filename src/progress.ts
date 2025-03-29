import { sortBy } from 'lodash';
import { activityVariantStatus } from '../components/ActivityStatusBadge';
import {
  ActivityVariantMetadata,
  CurriculumMetadata,
} from './localStorage/schema';
import { isPlayground } from './playground';
import { Activity } from './schemas/activitySchema';
import { Curriculum, curriculumToId } from './schemas/curriculumSchema';
import { isSpecialActivity } from './specialActivities';

export function findStartedCurricula(
  curricula: CurriculumMetadata[],
  allCurricula: Curriculum[],
) {
  const userCurriculaIds = curricula.map((c) => c.id);
  return allCurricula.filter((c) =>
    userCurriculaIds.includes(curriculumToId(c)),
  );
}

export function findUserActivities(
  activities: ActivityVariantMetadata[],
  allActivities: Activity[],
) {
  // Find in-progress or completed activities and sort them appropriately
  const activitiesWithVariants = allActivities.flatMap((a) =>
    a.variants.flatMap((v) => ({ activity: a, variant: v })),
  );
  return sortBy(activitiesWithVariants, ({ variant }) => {
    const status = activityVariantStatus(activities, variant);
    if (status === 'completed') {
      return 1;
    }
    if (status === 'in-progress') {
      return 0;
    }
    return 2;
  }).filter(({ variant: v }) => {
    if (
      isPlayground(v.authorSlug, v.activitySlug, v.language, v.version) ||
      isSpecialActivity(v)
    ) {
      return false;
    }
    const status = activityVariantStatus(activities, v);
    return status !== 'initial';
  });
}
