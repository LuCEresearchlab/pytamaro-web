import type { NextApiRequest, NextApiResponse } from 'next';
import saveCodeExecutionInputEvent from '../../../src/db/events/codeExecutionInputEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { uuid, experimentKey, executionUUID, seq, content } = req.body;
  const saved = await saveCodeExecutionInputEvent(
    uuid,
    experimentKey,
    executionUUID,
    seq,
    content,
  );
  res.status(saved ? 200 : 500).send({});
}

export const config = {
  api: {
    bodyParser: {
      // Discard unreasonably large inputs (~ bigger than 10 thousand characters) to prevent abuse and save DB space
      sizeLimit: '10kb',
    },
  },
};
