import { PlaylistAddCheck, PlaylistRemove } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { curriculumFromId } from '../src/schemas/curriculumSchema';
import { curriculumWithAnchor } from '../src/urlUtils';
import useCurriculumFromQuery from '../src/useCurriculumFromQuery';

export default function CompleteButton({ completed, toggleCompleted, activityVariant }:
{ completed: boolean, toggleCompleted: () => void, activityVariant: ActivityVariant }) {
  const router = useRouter();
  const curriculumId = useCurriculumFromQuery();
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const handleClick = () => {
    const shouldRedirect = !completed && curriculumId;
    if (shouldRedirect) {
      setRedirectInProgress(true);
    }
    toggleCompleted();
    if (shouldRedirect) {
      const { authorSlug, curriculumSlug } = curriculumFromId(curriculumId);
      router.push(curriculumWithAnchor(authorSlug, curriculumSlug, activityVariant));
    }
  };
  const definitelyCompleted = completed && !redirectInProgress;
  let message = definitelyCompleted ? 'Remove From Completed Activites' : 'Complete & Continue';
  if (!completed && !curriculumId) {
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
