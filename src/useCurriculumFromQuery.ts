import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CURRICULUM_QUERY_PARAM } from './urlUtils';

export default function useCurriculumFromQuery() {
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

  return curriculumId;
}
