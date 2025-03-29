import type { NextApiRequest, NextApiResponse } from 'next';
import saveCurriculumNavigationEvent from '../../../src/db/events/curriculumNavigationEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { uuid, experimentKey, activityVariant, curriculum, navigationType } =
    req.body;
  const saved = await saveCurriculumNavigationEvent(
    uuid,
    experimentKey,
    activityVariant,
    curriculum,
    navigationType,
  );
  res.status(saved ? 200 : 500).send({});
}
