import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Button, Tooltip } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import {
  NavigationDirection,
  anchorName,
  anchorNameNextOrPreviousStep,
  findInCurriculum,
  findStepIdx,
  findUnit,
  nextOrPreviousObviousActivity,
} from '../src/curricula';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { Curriculum, CurriculumUnit } from '../src/schemas/curriculumSchema';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import {
  activityVariantWithCurriculum,
  curriculumWithAnchor,
} from '../src/urlUtils';

function nextOrPreviousActivityIfPossible(
  activityVariant: ActivityVariant,
  curriculum: Curriculum,
  direction: NavigationDirection,
) {
  const currentUnit = findUnit(curriculum, activityVariant) as CurriculumUnit;
  const currentStepIdx = findStepIdx(currentUnit, activityVariant);
  return nextOrPreviousObviousActivity(currentUnit, currentStepIdx, direction)
    ?.variant;
}

export default function NavigateToActivity({
  activityVariant,
  curriculum,
  direction,
  completed,
}: {
  activityVariant: ActivityVariant;
  curriculum: Curriculum;
  direction: NavigationDirection;
  completed: boolean;
}) {
  const { t } = useTranslation('activityfooter');
  const { metadata } = useLocalProfile();
  const [loading, setLoading] = useState(false);

  const isNext = direction === 'next';

  const targetActivity = nextOrPreviousActivityIfPossible(
    activityVariant,
    curriculum,
    direction,
  );

  const logEvent = (navigationType: string, activity: ActivityVariant) => {
    storeDbEvent(EventName.CurriculumNavigation, metadata, {
      navigationType,
      curriculum,
      activityVariant: activity,
    });
  };

  const handleClick = () => {
    setLoading(true);
    logEvent(isNext ? 'next_activity' : 'previous_activity', activityVariant);
    let url = '';
    if (targetActivity) {
      url = activityVariantWithCurriculum(targetActivity, curriculum);
      logEvent('open_activity', targetActivity);
    } else {
      const { unitIdx, stepIdx, activityIdx } = findInCurriculum(
        curriculum,
        activityVariant,
      );
      const anchor = anchorName(unitIdx, stepIdx, activityIdx);
      const anchorTo = anchorNameNextOrPreviousStep(
        curriculum,
        unitIdx,
        stepIdx,
        direction,
      );
      url = curriculumWithAnchor(
        curriculum.authorSlug,
        curriculum.slug,
        anchor,
        anchorTo,
      );
    }
    window.location.assign(url);
  };

  const messageKey =
    (isNext ? 'next' : 'previous') + (targetActivity ? 'Activity' : '');
  const message = t(messageKey);

  const enabled = (isNext && completed) || !isNext;

  return (
    <Tooltip arrow title={enabled ? undefined : t('availableAfterCompleting')}>
      <div>
        <Button
          loading={loading}
          disabled={!enabled}
          variant='contained'
          color={isNext ? 'success' : 'warning'}
          startIcon={isNext ? undefined : <ArrowBack />}
          endIcon={isNext ? <ArrowForward /> : undefined}
          onClick={handleClick}
        >
          <span>{message}</span>
        </Button>
      </div>
    </Tooltip>
  );
}
