import { Box, Button } from '@mui/material';
import { Route } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CURRICULUM_QUERY_PARAM, curriculumPathname } from '../src/urlUtils';
import { curriculumFromId } from '../src/schemas/curriculumSchema';

export default function BackToCurriculum() {
  const router = useRouter();
  const [curriculumId, setCurriculumId] = useState<string | null>(null);
  useEffect(() => {
    if (router.isReady) {
      const queryCurriculumId = router.query[CURRICULUM_QUERY_PARAM];
      if (typeof queryCurriculumId === 'string') {
        setCurriculumId(queryCurriculumId);
      }
    }
  }, [router.isReady, router.query]);

  if (curriculumId === null) {
    return null;
  }

  const {
    authorSlug,
    curriculumSlug,
  } = curriculumFromId(curriculumId);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Route />}
        onClick={() => router.push(curriculumPathname(authorSlug, curriculumSlug))}
      >
        Back to your curriculum
      </Button>
    </Box>
  );
}
