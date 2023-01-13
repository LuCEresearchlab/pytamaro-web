import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ExecutionResponse } from '../../src/NotebooksManager';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutionResponse>,
) {
  const data = {
    image: 'glot/pytamaro:latest',
    payload: {
      language: 'python',
      files: [
        {
          name: 'main.py',
          content: req.body.code,
        },
      ],
    },
  };
  let resData;
  try {
    const glotResponse = await axios.post(
      `${process.env.GLOT_RUNNER_URL}/run`,
      data,
      {
        headers:
          {
            'X-Access-Token': process.env.GLOT_SECRET_TOKEN,
            'Content-Type': 'application/json',
          },
      },
    );
    if (glotResponse.data.error.length > 0) {
      resData = { type: 'error', content: glotResponse.data.stderr };
    } else {
      resData = { type: 'success', content: glotResponse.data.stdout };
    }
  } catch (e) {
    // @ts-ignore
    resData = { type: 'error', content: e.response?.data?.message };
  }
  res.status(200).json(resData);
}
