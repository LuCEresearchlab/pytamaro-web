import type { NextApiRequest, NextApiResponse } from 'next';
import saveUserFeedbackEvent from '../../../src/db/events/userFeedbackEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    uuid, experimentKey, name, email, message, pathname,
  } = req.body;
  const saved = await saveUserFeedbackEvent(
    uuid,
    experimentKey,
    name,
    email,
    message,
    pathname,
  );
  res.status(saved ? 200 : 500).send({});
}
