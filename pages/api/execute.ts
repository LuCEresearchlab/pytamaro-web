import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  CELL_FILE,
  cellsToFiles,
  DRIVER_FILE,
} from '../../src/execution/codeExecution';
import { ToolboxFunction } from '../../src/localStorage/schema';
import { PythonFile } from '../../src/schemas/activitySchema';

export type ServerSideExecutionResponse =
  | CompletedExecutionResponse
  | FailedExecution;

export interface CompletedExecutionResponse {
  type: 'success' | 'error';
  stdout: string;
  stderr: string;
}

export interface FailedExecution {
  type: 'time-limit-exceeded' | 'output-limit-exceeded' | 'network-error';
}

export function isCompleted(
  response: ServerSideExecutionResponse | undefined,
): response is CompletedExecutionResponse {
  return response === undefined
    ? false
    : response.type === 'success' || response.type === 'error';
}

function driverCode(num_cells: number) {
  return `
from pathlib import Path
import linecache
import sys

globals_dict = {}

def run(name):
    filename = name + ".py"
    source = Path(filename).read_text()
    code = compile(source, filename, "exec")
    linecache.cache[filename] = [lambda: source]
    exec(code, globals_dict)

for idx in range(0, ${num_cells}):
    print(f"@@@PYTAMARO_SET_ACTIVE_CELL({idx})@@@", file=sys.stdout, end="")
    print(f"@@@PYTAMARO_SET_ACTIVE_CELL({idx})@@@", file=sys.stderr, end="")
    run(f"${CELL_FILE}{idx}")
`;
}

const dummySuccessfulResponse: ServerSideExecutionResponse = {
  type: 'success',
  stdout: 'Hello, world!',
  stderr: '(Demo output - Only shown in development mode)',
};

async function doExecution(
  cells: string[],
  idx: number,
  toolboxFunctions: ToolboxFunction[],
  extraPythonFiles: PythonFile[],
): Promise<ServerSideExecutionResponse> {
  const files = cellsToFiles(
    cells,
    idx,
    toolboxFunctions,
    extraPythonFiles,
  ).map(
    // Replace CSE driver with glot-driver
    (file) =>
      file.name === `${DRIVER_FILE}.py`
        ? { name: file.name, content: driverCode(idx + 1) }
        : file,
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
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
  res: NextApiResponse<ServerSideExecutionResponse>,
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
