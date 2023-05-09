import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'redis';
import crypto from 'crypto';
import { ExecutionResponse, cellsToFiles } from '../../src/codeExecution';

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

async function doExecution(sources: string[], idx: number) {
  const files = cellsToFiles(sources, idx);
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutionResponse>,
) {
  const { sources, idx } = req.body;
  const key = await computeKey(JSON.stringify({
    sources,
    idx,
    image: process.env.GLOT_IMAGE_TAG,
  }));
  const cacheResult = await retrieveFromCache(key);
  let response;
  if (cacheResult) {
    response = JSON.parse(cacheResult);
  } else {
    response = await doExecution(sources, idx);
    saveToCache(key, JSON.stringify(response));
  }
  res.status(200).json(response);
}
