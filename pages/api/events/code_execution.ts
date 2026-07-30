import type { NextApiRequest, NextApiResponse } from 'next';
import saveCodeExecutionEvent from '../../../src/db/events/codeExecutionEvent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    uuid,
    experimentKey,
    sources,
    initialSources,
    requestedCellSequenceNumber,
    activityVariant,
    toolboxFunctions,
    extraPythonFiles,
    liveAnalysis,
    executionUUID,
    clientSideExecutionTag,
  } = req.body;
  if (clientSideExecutionTag === undefined) {
    res.status(500).send({});
    return;
  }
  const saved = await saveCodeExecutionEvent(
    uuid,
    experimentKey,
    sources,
    initialSources,
    activityVariant,
    clientSideExecutionTag,
    requestedCellSequenceNumber,
    toolboxFunctions,
    extraPythonFiles,
    liveAnalysis,
    executionUUID,
  );
  res.status(saved ? 200 : 500).send({});
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
