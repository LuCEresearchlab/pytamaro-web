import type { NextApiRequest, NextApiResponse } from 'next';
import saveDoNowCompletedEvent from '../../../src/db/events/doNowCompletedEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    uuid, experimentKey, activityVariant, id, answer,
  } = req.body;
  const saved = await saveDoNowCompletedEvent(
    uuid,
    experimentKey,
    activityVariant,
    id,
    answer,
  );
  res.status(saved ? 200 : 500).send({});
}
