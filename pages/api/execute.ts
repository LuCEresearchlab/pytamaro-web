import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ExecutionResponse, cellsToFiles } from '../../src/codeExecution';
import { ToolboxFunction } from '../../src/localStorage/schema';
import { PythonFile } from '../../src/schemas/activitySchema';

const dummySuccessfulResponse: ExecutionResponse = {
  type: 'success',
  stdout: 'Hello, world!',
  stderr: '(Demo output - Only shown in development mode)',
};

async function doExecution(
  sources: string[],
  idx: number,
  toolboxFunctions: ToolboxFunction[],
  extraPythonFiles: PythonFile[],
): Promise<ExecutionResponse> {
  const files = await cellsToFiles(
    sources,
    idx,
    toolboxFunctions,
    extraPythonFiles,
  );
  const data = {
    image: process.env.GLOT_IMAGE_TAG,
    payload: {
      language: 'python',
      files,
    },
  };
  try {
    const glotResponse = (
      await axios.post(`${process.env.GLOT_RUNNER_URL}/run`, data, {
        headers: {
          'X-Access-Token': process.env.GLOT_SECRET_TOKEN,
          'Content-Type': 'application/json',
        },
      })
    ).data;
    return {
      type: glotResponse.error.length > 0 ? 'error' : 'success',
      stdout: glotResponse.stdout,
      stderr: glotResponse.stderr,
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorData = err.response?.data;
      if (errorData) {
        if (errorData.error === 'limits.execution_time')
          return { type: 'time-limit-exceeded' };
        if (errorData.error === 'limits.read.size')
          return { type: 'output-limit-exceeded' };
      }
    }
    // No better information available, just return a generic network error
    // (and log it on the server)
    // eslint-disable-next-line no-console
    console.error(err);
    return { type: 'network-error' };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutionResponse>,
) {
  const { sources, idx, toolboxFunctions, extraPythonFiles } = req.body;
  let response = await doExecution(
    sources,
    idx,
    toolboxFunctions,
    extraPythonFiles,
  );
  if (
    response.type === 'network-error' &&
    process.env.NODE_ENV === 'development'
  ) {
    response = dummySuccessfulResponse;
  }
  res.status(200).json(response);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
