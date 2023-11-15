import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  NavigationDirection,
  anchorName,
  anchorNameNextOrPreviousStep,
  findInCurriculum,
  findStepIdx, findUnit,
  nextOrPreviousObviousActivity,
} from '../src/curricula';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { Curriculum, CurriculumUnit } from '../src/schemas/curriculumSchema';
import { activityVariantWithCurriculum, curriculumWithAnchor } from '../src/urlUtils';

function nextOrPreviousActivityIfPossible(
  activityVariant: ActivityVariant,
  curriculum: Curriculum,
  direction: NavigationDirection,
) {
  const currentUnit = findUnit(curriculum, activityVariant) as CurriculumUnit;
  const currentStepIdx = findStepIdx(currentUnit, activityVariant);
  return nextOrPreviousObviousActivity(currentUnit, currentStepIdx, direction)?.variant;
}

export default function NavigateToActivity({
  activityVariant, curriculum, direction, completed,
}:
{ activityVariant: ActivityVariant, curriculum: Curriculum,
  direction: NavigationDirection, completed: boolean }) {
  const { t } = useTranslation('activityfooter');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isNext = direction === 'next';

  const targetActivity = nextOrPreviousActivityIfPossible(activityVariant, curriculum, direction);

  const handleClick = () => {
    setLoading(true);
    let url = '';
    if (targetActivity) {
      url = activityVariantWithCurriculum(targetActivity, curriculum);
    } else {
      const { unitIdx, stepIdx, activityIdx } = findInCurriculum(curriculum, activityVariant);
      const anchor = anchorName(unitIdx, stepIdx, activityIdx);
      const anchorTo = anchorNameNextOrPreviousStep(curriculum, unitIdx, stepIdx, direction);
      url = curriculumWithAnchor(curriculum.authorSlug, curriculum.slug, anchor, anchorTo);
    }
    router.push(url);
  };

  const messageKey = isNext ? t('next') : t('previous') + (targetActivity ? 'Activity' : '');
  const message = t(messageKey);

  const enabled = (isNext && completed) || !isNext;

  return (
    <Tooltip arrow title={enabled ? undefined : t('availableAfterCompleting')}>
      <span>
        <LoadingButton
          loading={loading}
          disabled={!enabled}
          variant="contained"
          color={isNext ? 'success' : 'warning'}
          startIcon={isNext ? undefined : <ArrowBack />}
          endIcon={isNext ? <ArrowForward /> : undefined}
          onClick={handleClick}
        >
          {message}
        </LoadingButton>
      </span>
    </Tooltip>
  );
}
