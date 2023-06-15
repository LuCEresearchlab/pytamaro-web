import type { NextApiRequest, NextApiResponse } from 'next';
import saveDeleteToolboxFunctionEvent from '../../../src/db/events/deleteToolboxFunctionEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    uuid, experimentKey, fn,
  } = req.body;
  const saved = await saveDeleteToolboxFunctionEvent(
    uuid,
    experimentKey,
    fn.name,
  );
  res.status(saved ? 200 : 500).send({});
}
