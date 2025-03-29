import axios from 'axios';
import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'redis';
import {
  CODE_EXECUTION_CELLS_TO_FILES_VERSION,
  ExecutionResponse,
  cellsToFiles,
} from '../../src/codeExecution';
import { ToolboxFunction } from '../../src/localStorage/schema';
import { PythonFile } from '../../src/schemas/activitySchema';

const dummySuccessfulResponse: ExecutionResponse = {
  type: 'success',
  stdout: 'Hello, world!',
  stderr: '(Demo output - Only shown in development mode)',
};

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
  },
  password: process.env.REDIS_PASSWORD,
});

async function connectToRedisIfNeeded() {
  if (!redisClient.isReady) {
    try {
      await redisClient.connect();
    } catch (e) {
      // could not connect to redis, ignore (as we can execute anyway),
      // but log this error for easier inspection
      // eslint-disable-next-line no-console
      console.log('Could not connect to redis', e);
    }
  }
}

async function retrieveFromCache(key: string) {
  await connectToRedisIfNeeded();
  if (redisClient.isReady) {
    const found = await redisClient.exists(key);
    if (found) {
      return redisClient.get(key);
    }
  }
  return null;
}

async function saveToCache(key: string, value: string) {
  await connectToRedisIfNeeded();
  if (redisClient.isReady) {
    await redisClient.set(key, value);
  }
}

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

async function computeKey(text: string) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.webcrypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function dataForKey(data: object) {
  return JSON.stringify({
    ...data,
    image: process.env.GLOT_IMAGE_TAG,
    cellsToFilesVersion: CODE_EXECUTION_CELLS_TO_FILES_VERSION,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutionResponse>,
) {
  const { sources, idx, toolboxFunctions, extraPythonFiles } = req.body;
  const key = await computeKey(
    dataForKey({
      sources,
      idx,
      toolboxFunctions,
      extraPythonFiles,
    }),
  );
  const cacheResult = await retrieveFromCache(key);
  let response;
  if (cacheResult) {
    response = JSON.parse(cacheResult);
  } else {
    response = await doExecution(
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
    if (response.type !== 'network-error') {
      saveToCache(key, JSON.stringify(response));
    }
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
