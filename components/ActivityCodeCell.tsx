import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { PythonMode } from '../src/execution/codeExecution';
import type { LocalActivityState } from '../src/localStorage/useLocalActivity';
import {
  ActivityVariant,
  PlatformConfiguration,
  PythonFile,
} from '../src/schemas/activitySchema';
import useReset from '../src/useReset';
import CodeCell from './CodeCell';
import MoreOptionsButton from './MoreOptionsButton';
import SaveToToolboxButton from './SaveToToolboxButton';

function InconsistencyMessage() {
  return (
    <Alert severity='error' sx={{ my: 2 }}>
      <AlertTitle>Inconsistency Detected</AlertTitle>
      <Typography>
        Code cells saved in your browser do not match the ones in the original
        notebook. This is a mistake on our side. Please send us a report using
        the feedback button.
      </Typography>
      <Typography gutterBottom>
        If you wish to work on this activity, you can delete the code saved in
        your browser using the &ldquo;Reset Activity&rdquo; button in the
        navigation bar at the top of this page. Note that doing this will delete
        all the code you previosuly wrote for this activity!
      </Typography>
      {process.env.NODE_ENV === 'development' && (
        <Typography
          sx={{
            fontWeight: 'bold',
          }}
        >
          If you are a content author, either increase the version number of
          this activity or delete the code previously saved in your browser
          using the reset button.
        </Typography>
      )}
    </Alert>
  );
}

// Within an activity, we always want Exec mode.
const pythonMode = PythonMode.Exec;

export default function ActivityCodeCell({
  activityState,
  activityVariant,
  cellIdx,
  extraPythonFiles,
  platformConfig,
  activityResetCounter,
  runEnabled,
}: {
  activityState: LocalActivityState;
  activityVariant: ActivityVariant;
  cellIdx: number;
  extraPythonFiles: PythonFile[];
  platformConfig: PlatformConfiguration;
  activityResetCounter: number;
  runEnabled: boolean;
}) {
  const {
    codeExecutionStates,
    setOutputAreaRef,
    handleInvalidateOutputsFrom,
    handleExecutionRequestEvent,
    handleExecute,
    handleToggleOutputArea,
    handleResetSingleCell,
    handleResetSingleCellExecutionState,
    handleRestartPyodide,
    localCodeCellsWrongLength,
    activitySession,
  } = activityState;

  const { resetCounter, newReset } = useReset();
  useEffect(() => {
    if (activityResetCounter > 0) {
      newReset();
    }
  }, [newReset, activityResetCounter]);

  const precedingLines = activitySession.precedingLines(cellIdx);
  return localCodeCellsWrongLength ? (
    <InconsistencyMessage />
  ) : (
    <Box
      sx={{
        marginY: 2,
      }}
    >
      <CodeCell
        codeCellExecutionState={codeExecutionStates[cellIdx]}
        onResetExecutionState={() =>
          handleResetSingleCellExecutionState(cellIdx)
        }
        onSourceChanged={() => handleInvalidateOutputsFrom(cellIdx)}
        onExecutionRequestEvent={(executionUUID) =>
          handleExecutionRequestEvent(cellIdx, executionUUID, pythonMode)
        }
        onExecutionRequested={(executionUUID) =>
          handleExecute(cellIdx, executionUUID, pythonMode)
        }
        onRuntimeErrorDismissed={() => handleInvalidateOutputsFrom(cellIdx)}
        firstLineNumber={1 + precedingLines}
        activityVariant={activityVariant}
        platformConfig={platformConfig}
        resetCounter={resetCounter}
        extraPythonFiles={extraPythonFiles}
        activitySession={activitySession}
        cellIdx={cellIdx}
        runEnabled={runEnabled}
        setOutputAreaRef={setOutputAreaRef}
        pythonMode={pythonMode}
        extraActions={
          <>
            <SaveToToolboxButton
              activitySession={activitySession}
              cellIdx={cellIdx}
              originalActivity={activityVariant}
            />
            <MoreOptionsButton
              activitySession={activitySession}
              cellIdx={cellIdx}
              codeCellExecutionState={codeExecutionStates[cellIdx]}
              onShowHideOutput={() => handleToggleOutputArea(cellIdx)}
              onReset={() => handleResetSingleCell(cellIdx, newReset)}
              onRestart={handleRestartPyodide}
            />
          </>
        }
      />
    </Box>
  );
}
