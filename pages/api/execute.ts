import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'redis';
import crypto from 'crypto';
import { ExecutionResponse } from '../../src/CodeExecution';

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

const DRIVER_FILE = 'driver.py';
const PREVIOUS_CELLS_FILE = 'previous_cells.py';
const CURRENT_CELL_FILE = 'cell.py';

// The source of the previous cells is embedded within a context manager that
// redirects stdout and stderr to None, so that the only the stdout/stderr of
// the current cell is considered.
const DRIVER_SOURCE = `
import friendly
friendly.install()
friendly.set_formatter("dark", color_system="truecolor")
friendly.exclude_file_from_traceback('/home/glot/${DRIVER_FILE}')
from contextlib import redirect_stdout, redirect_stderr
with redirect_stdout(None), redirect_stderr(None):
    import previous_cells
import cell
`;

async function doExecution(previousCellsSource: string, currentCellSource: string) {
  const data = {
    image: process.env.GLOT_IMAGE_TAG,
    payload: {
      language: 'python',
      files: [
        {
          name: `${DRIVER_FILE}`,
          content: DRIVER_SOURCE,
        },
        {
          name: `${PREVIOUS_CELLS_FILE}`,
          content: previousCellsSource || 'pass',
        },
        {
          name: `${CURRENT_CELL_FILE}`,
          content: currentCellSource || 'pass',
        },
      ],
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

async function computeKey(code: string) {
  const msgUint8 = new TextEncoder().encode(code);
  const hashBuffer = await crypto.webcrypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutionResponse>,
) {
  const { previousCellsSource, currentCellSource } = req.body;
  const key = await computeKey(JSON.stringify({ previousCellsSource, currentCellSource }));
  const cacheResult = await retrieveFromCache(key);
  let response;
  if (cacheResult) {
    response = JSON.parse(cacheResult);
  } else {
    response = await doExecution(previousCellsSource, currentCellSource);
    saveToCache(key, JSON.stringify(response));
  }
  res.status(200).json(response);
}
