import { Route } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { curriculumFromId } from '../src/schemas/curriculumSchema';
import { CURRICULUM_QUERY_PARAM, curriculumPathname } from '../src/urlUtils';

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
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Route />}
        onClick={() => router.push(curriculumPathname(authorSlug, curriculumSlug))}
      >
        Back to my curriculum
      </Button>
    </Box>
  );
}
