import { PlaylistAddCheck, PlaylistRemove } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  findStepIdx, findUnit, nextObviousActivity,
} from '../src/curricula';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { Curriculum, CurriculumUnit } from '../src/schemas/curriculumSchema';
import { activityVariantWithCurriculum, curriculumWithAnchor } from '../src/urlUtils';

function nextActivityIfPossible(activityVariant: ActivityVariant, curriculum: Curriculum) {
  const currentUnit = findUnit(curriculum, activityVariant) as CurriculumUnit;
  const currentStepIdx = findStepIdx(currentUnit, activityVariant);
  return nextObviousActivity(currentUnit, currentStepIdx)?.variant;
}

export default function CompleteActivityButton({
  completed, toggleCompleted, activityVariant, curriculum,
}:
{ completed: boolean, toggleCompleted: () => void, activityVariant: ActivityVariant,
  curriculum: Curriculum | undefined }) {
  const router = useRouter();
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  let nextActivity : ActivityVariant | undefined;
  if (curriculum) {
    nextActivity = nextActivityIfPossible(activityVariant, curriculum);
  }

  const handleClick = () => {
    const shouldRedirect = !completed && curriculum;
    if (shouldRedirect) {
      setRedirectInProgress(true);
    }
    toggleCompleted();
    if (shouldRedirect) {
      const url = nextActivity
        ? activityVariantWithCurriculum(nextActivity, curriculum)
        : curriculumWithAnchor(curriculum.authorSlug, curriculum.slug, activityVariant);
      router.push(url);
    }
  };

  const definitelyCompleted = completed && !redirectInProgress;

  let message = 'Remove From Completed Activites';
  if (!definitelyCompleted) {
    message = nextActivity ? 'Complete & Go To Next' : 'Complete & Continue';
  }
  if (!completed && curriculum === undefined) {
    // Activity done outside a curriculum
    message = 'Mark Activity as Complete';
  }

  return (
    <Button
      variant="contained"
      disabled={redirectInProgress}
      color={definitelyCompleted ? 'error' : 'success'}
      startIcon={definitelyCompleted ? <PlaylistRemove /> : <PlaylistAddCheck />}
      onClick={handleClick}
    >
      {message}
    </Button>
  );
}
