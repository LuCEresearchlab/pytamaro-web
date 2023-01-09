import type { NextApiRequest, NextApiResponse } from 'next';
import { newKernel } from '../../src/NotebooksManager';

interface NewKernelResponse {
  kernelId: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewKernelResponse>,
) {
  if (process.env.ALLOW_CODE_EXECUTION !== 'true') {
    return;
  }
  const kernelId = await newKernel();
  res.status(200).json({ kernelId });
}
