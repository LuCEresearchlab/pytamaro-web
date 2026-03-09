import { Stack } from '@mui/material';
import { isExecutionNominal } from '../src/execution/codeExecution';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { PythonFile } from '../src/schemas/activitySchema';
import DownloadCodeButton from './CodeDownloadButton';
import ExecutionOutputArea from './input_output/ExecutionOutputArea';

export default function HourOfCodeCastle({
  language,
  extraPythonFiles,
}: {
  language: string;
  extraPythonFiles: PythonFile[];
}) {
  const activityVariant = {
    authorSlug: 'luce-hoc',
    activitySlug: 'build-your-castle',
    version: 'v1',
    language,
  };
  const { codeCells, codeExecutionStates } = useLocalActivity(
    [],
    activityVariant,
  );
  const executionResponse = codeExecutionStates[0]?.executionResponse;
  return (
    <Stack direction='column' spacing={2}>
      {executionResponse && isExecutionNominal(executionResponse) && (
        <ExecutionOutputArea
          executionResponse={executionResponse}
          setOutputAreaRef={() => null}
          setIsWaitingForInput={() => {}}
        />
      )}
      <DownloadCodeButton
        codeCells={codeCells}
        extraPythonFiles={extraPythonFiles}
      />
    </Stack>
  );
}
