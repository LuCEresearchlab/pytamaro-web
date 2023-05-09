import type { NextApiRequest, NextApiResponse } from 'next';
import saveAPILookupEvent from '../../../src/db/events/apiLookupEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    uuid, experimentKey, name, activityVariant,
  } = req.body;
  const saved = await saveAPILookupEvent(
    uuid,
    experimentKey,
    name,
    activityVariant,
  );
  res.status(saved ? 200 : 500).send({});
}
