import { activityVariantStatus } from '../components/ActivityStatusBadge';
import { allActivities } from './curricula';
import { ActivityVariantMetadata } from './localStorage/schema';
import { Curriculum, CurriculumActivity, CurriculumCompetency } from './schemas/curriculumSchema';

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
    (activity) => activityVariantStatus(userActivities, activity.variant, activity.fallbackIds) === 'completed',
  );
}

export function competencyColor(competency: CurriculumCompetency) {
  return competency.category === 'programming' ? 'primary' : 'secondary';
}

export function findUserCompetencies(
  curriculum: Curriculum,
  userActivities: ActivityVariantMetadata[],
) {
  const competenciesWithActivities = curriculum.competencies.map(
    (competency) => {
      const activities = allActivitiesForCompetency(curriculum, competency);
      const completedActivities = completedActivitiesForCompetency(activities, userActivities);
      return {
        competency,
        allActivities: activities,
        completedActivities,
      };
    },
  );

  return competenciesWithActivities.filter(
    ({ completedActivities }) => completedActivities.length > 0,
  );
}
