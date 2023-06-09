import axios from 'axios';
import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'redis';
import { CODE_EXECUTION_CELLS_TO_FILES_VERSION, ExecutionResponse, cellsToFiles } from '../../src/codeExecution';
import { ToolboxFunction } from '../../src/localStorage/schema';

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

async function doExecution(sources: string[], idx: number, toolboxFunctions: ToolboxFunction[]) {
  const files = await cellsToFiles(sources, idx, toolboxFunctions);
  const data = {
    image: process.env.GLOT_IMAGE_TAG,
    payload: {
      language: 'python',
      files,
    },
  };
  let resData;
  try {
    const glotResponse = (await axios.post(
      `${process.env.GLOT_RUNNER_URL}/run`,
      data,
      {
        headers:
          {
            'X-Access-Token': process.env.GLOT_SECRET_TOKEN,
            'Content-Type': 'application/json',
          },
      },
    )).data;
    if (glotResponse.error.length > 0) {
      resData = { type: 'error', content: glotResponse.stdout + glotResponse.stderr };
    } else {
      resData = { type: 'success', content: glotResponse.stdout };
    }
  } catch (e) {
    // @ts-ignore
    resData = { type: 'error', content: e.response?.data?.message };
  }
  return resData;
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
  const { sources, idx, toolboxFunctions } = req.body;
  const key = await computeKey(dataForKey({ sources, idx, toolboxFunctions }));
  const cacheResult = await retrieveFromCache(key);
  let response;
  if (cacheResult) {
    response = JSON.parse(cacheResult);
  } else {
    response = await doExecution(sources, idx, toolboxFunctions);
    saveToCache(key, JSON.stringify(response));
  }
  res.status(200).json(response);
}
