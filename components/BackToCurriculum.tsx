import { Route } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { ActivityVariant, activityVariantId } from '../src/schemas/activitySchema';
import { Curriculum, curriculumFromId } from '../src/schemas/curriculumSchema';
import { activityPathname, activityVariantPathname, curriculumPathname } from '../src/urlUtils';
import useCurriculumFromQuery from '../src/useCurriculumFromQuery';


export default function BackToCurriculum({
  activityVariant, curriculum, completed,
}:
  {
    activityVariant: ActivityVariant,
    curriculum: Curriculum,
    completed: boolean,
  }) {
  const router = useRouter();
  const curriculumId = useCurriculumFromQuery();

  if (!curriculumId) {
    return null;
  }

  const {
    authorSlug,
    curriculumSlug,
  } = curriculumFromId(curriculumId);

  const href = `${curriculumPathname(authorSlug, curriculumSlug)}#${activityVariantId(activityVariant)}`;

  const currentActivityVariantId = activityVariantId(activityVariant);
  const units = curriculum.units;
  const steps = units.flatMap((unit) => unit.steps);
  const activities = steps.flatMap((step) => step.activities);
  const currenctActivityId = activities.findIndex((activity) => activityVariantId(activity.variant) === currentActivityVariantId);
  const nextActivity = activities[currenctActivityId + 1];
  const previousActivity = activities[currenctActivityId - 1] || null;

  const currentUrl = window.location.href;
  const currentUrlParts = currentUrl.split('?');
  const currentUrlLastPart = currentUrlParts[currentUrlParts.length - 1];

  const nextActivityPath = nextActivity && completed ? activityVariantPathname(nextActivity.variant) + '?' + currentUrlLastPart : null;
  const previousActivityPath = previousActivity ? activityVariantPathname(previousActivity.variant) + '?' + currentUrlLastPart : null;

  // compute nextActivityPath only if the current activity is marked as completed
  console.log(activities[currenctActivityId])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
      {previousActivityPath && (
        <Button
          variant="outlined"
          color="success"
          onClick={() => router.push(previousActivityPath)}
          sx={{ ml: 2, mr: 2 }}
        >
          Previous Activity
        </Button>
      )}
      <Button
        variant="outlined"
        color="error"
        startIcon={<Route />}
        onClick={() => router.push(href)}
      >
        Back to my curriculum
      </Button>
      {nextActivityPath && (
        <Button
          variant="outlined"
          color="success"
          onClick={() => router.push(nextActivityPath)}
          sx={{ ml: 2 }}
        >
          Next Activity
        </Button>
      )}
    </Box>
  );
}
