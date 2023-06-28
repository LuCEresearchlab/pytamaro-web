import { activityVariantStatus } from '../components/ActivityStatusBadge';
import { ActivityVariantMetadata } from './localStorage/schema';
import { Curriculum, CurriculumActivity, CurriculumCompetency } from './schemas/curriculumSchema';

function allActivities(curriculum: Curriculum) {
  return curriculum.units.flatMap(
    (unit) => unit.steps.flatMap((step) => step.activities),
  );
}

export function allActivitiesForCompetency(
  curriculum: Curriculum,
  competency: CurriculumCompetency,
) {
  return allActivities(curriculum).filter(
    (activity) => activity.learningObjectives.includes(competency.id),
  );
}

export function completedActivitiesForCompetency(
  activities: CurriculumActivity[],
  userActivities: ActivityVariantMetadata[],
) {
  return activities.filter(
    (activity) => activityVariantStatus(userActivities, activity.variant) === 'completed',
  );
}

export function competencyColor(competency: CurriculumCompetency) {
  return competency.category === 'programming' ? 'primary' : 'secondary';
}
