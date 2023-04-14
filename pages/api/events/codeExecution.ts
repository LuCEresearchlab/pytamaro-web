import type { NextApiRequest, NextApiResponse } from 'next';
import saveCodeExecutionEvent from '../../../src/db/codeExecutionEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { uuid, code, activityVariant } = req.body;
  const image = process.env.GLOT_IMAGE_TAG;
  if (image === undefined) {
    res.status(500).send({});
    return;
  }
  const saved = await saveCodeExecutionEvent(code, activityVariant, image, uuid);
  res.status(saved ? 200 : 500).send({});
}
