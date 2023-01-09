import type { NextApiRequest, NextApiResponse } from 'next';
import { executeCode, ExecutionResponse } from '../../src/NotebooksManager';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutionResponse>,
) {
  if (process.env.ALLOW_CODE_EXECUTION !== 'true') {
    return;
  }
  const data = await executeCode(req.body.kernelId, req.body.code);
  res.status(200).json(data);
}
