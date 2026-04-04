import type { NextApiRequest, NextApiResponse } from 'next';
import saveCodeExecutionErrorsWarningEvent from '../../../src/db/events/codeExecutionErrorsWarningEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { uuid, experimentKey, executionUUID, forced_execution } = req.body;
  const saved = await saveCodeExecutionErrorsWarningEvent(
    uuid,
    experimentKey,
    executionUUID,
    forced_execution,
  );
  res.status(saved ? 200 : 500).send({});
}
