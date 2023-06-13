import type { NextApiRequest, NextApiResponse } from 'next';
import saveAddToolboxFunctionEvent from '../../../src/db/events/addToolboxFunctionEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    uuid, experimentKey, fn,
  } = req.body;
  const saved = await saveAddToolboxFunctionEvent(
    uuid,
    experimentKey,
    fn,
  );
  res.status(saved ? 200 : 500).send({});
}
