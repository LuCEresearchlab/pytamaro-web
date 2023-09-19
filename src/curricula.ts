import { isEqual } from 'lodash';
import { ActivityVariant } from './schemas/activitySchema';
import { Curriculum, CurriculumUnit } from './schemas/curriculumSchema';

export function allActivities(curriculum: Curriculum) {
  return curriculum.units.flatMap(
    (unit) => unit.steps.flatMap((step) => step.activities),
  );
}

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

export function findStepIdx(unit: CurriculumUnit, activityVariant: ActivityVariant) {
  return unit.steps.findIndex(
    (step) => step.activities.some(
      (activity) => isEqual(activity.variant, activityVariant),
    ),
  );
}

export function findUnit(curriculum: Curriculum, activityVariant: ActivityVariant) {
  return curriculum.units.find(
    (unit) => findStepIdx(unit, activityVariant) !== -1,
  );
}

/*
 * A "next obvious activity" exists if the current curriculum unit has still a next step,
 * that step is not optional and has only one activity.
 * In that case, the next obvious activity is the single only activity of that step.
 */
export function nextObviousActivity(
  currentUnit: CurriculumUnit,
  stepIdxInUnit: number,
) {
  if (currentUnit.steps.length <= stepIdxInUnit + 1) {
    return undefined;
  }
  const nextStep = currentUnit.steps[stepIdxInUnit + 1];
  if (nextStep.isOptional || nextStep.activities.length > 1) {
    return undefined;
  }
  return nextStep.activities[0];
}
