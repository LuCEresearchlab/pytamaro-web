import { Route } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { ActivityVariant, activityVariantId } from '../src/schemas/activitySchema';
import { curriculumFromId } from '../src/schemas/curriculumSchema';
import { curriculumPathname } from '../src/urlUtils';
import useCurriculumFromQuery from '../src/useCurriculumFromQuery';

export default function BackToCurriculum({ activityVariant }:
{ activityVariant: ActivityVariant }) {
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

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Route />}
        onClick={() => router.push(href)}
      >
        Back to my curriculum
      </Button>
    </Box>
  );
}
