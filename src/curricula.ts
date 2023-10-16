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
  return curricula.filter(
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

export function findUnitIdx(curriculum: Curriculum, activityVariant: ActivityVariant) {
  return curriculum.units.findIndex(
    (unit) => findStepIdx(unit, activityVariant) !== -1,
  );
}

export function findUnit(curriculum: Curriculum, activityVariant: ActivityVariant) {
  const maybeIdx = findUnitIdx(curriculum, activityVariant);
  return maybeIdx === -1 ? undefined : curriculum.units[maybeIdx];
}

export type NavigationDirection = 'next' | 'previous';

/*
 * A "next obvious activity" exists if the current curriculum unit has still a next step,
 * that step is not optional and has only one activity.
 * In that case, the next obvious activity is the single only activity of that step.
 * The same goes for the previous obvious activity.
 */
export function nextOrPreviousObviousActivity(
  currentUnit: CurriculumUnit,
  stepIdxInUnit: number,
  direction: NavigationDirection,
) {
  const targetStepIdx = stepIdxInUnit + (direction === 'next' ? 1 : -1);
  if (targetStepIdx < 0 || targetStepIdx >= currentUnit.steps.length) {
    return undefined;
  }
  const targetStep = currentUnit.steps[targetStepIdx];
  if (targetStep.isOptional || targetStep.activities.length > 1) {
    return undefined;
  }
  return targetStep.activities[0];
}

export function anchorName(unitIdx: number, stepIdx?: number, activityIdx?: number) : string {
  let name = `unit-${unitIdx}`;
  if (stepIdx !== undefined) { name += `-step-${stepIdx}`; }
  if (activityIdx !== undefined) { name += `-activity-${activityIdx}`; }
  return name;
}

export function anchorNameNextOrPreviousStep(
  curriculum: Curriculum,
  unitIdx: number,
  stepIdx: number,
  direction: NavigationDirection,
) {
  let targetStepIdx = stepIdx + (direction === 'next' ? 1 : -1);
  let targetUnitIdx = unitIdx;
  if (targetStepIdx < 0) {
    targetUnitIdx -= 1;
    if (targetUnitIdx < 0) {
      return 'start';
    }
    targetStepIdx = curriculum.units[targetUnitIdx].steps.length - 1;
  } else if (targetStepIdx >= curriculum.units[targetUnitIdx].steps.length) {
    targetUnitIdx += 1;
    if (targetUnitIdx >= curriculum.units.length) {
      return 'end';
    }
    targetStepIdx = 0;
  }
  // Default to the first activity of the step
  return anchorName(targetUnitIdx, targetStepIdx, 0);
}
