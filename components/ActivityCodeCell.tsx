import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { sum } from 'lodash';
import { useEffect } from 'react';
import { CodeCellState } from '../src/localStorage/schema';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import {
  ActivityVariant,
  PlatformConfiguration,
  PythonFile,
} from '../src/schemas/activitySchema';
import { countLines } from '../src/sourceUtils';
import usePythonAnalyzer from '../src/usePythonAnalyzer';
import useReset from '../src/useReset';
import CodeCell from './CodeCell';
import FailedExecutionSnackbar from './FailedExecutionSnackbar';
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
        <Typography fontWeight='bold'>
          If you are a content author, either increase the version number of
          this activity or delete the code previously saved in your browser
          using the reset button.
        </Typography>
      )}
    </Alert>
  );
}

export default function ActivityCodeCell({
  activityVariant,
  initialCodeCells,
  cellIdx,
  extraPythonFiles,
  platformConfig,
  activityResetCounter,
}: {
  activityVariant: ActivityVariant;
  initialCodeCells: CodeCellState[];
  cellIdx: number;
  extraPythonFiles: PythonFile[];
  platformConfig: PlatformConfiguration;
  activityResetCounter: number;
}) {
  const {
    codeCells,
    codeExecutionStates,
    executionFailed,
    handleSourceChanged,
    handleExecute,
    sourcesUpTo,
    handleToggleOutputArea,
    handleResetSingleCell,
    localCodeCellsWrongLength,
  } = useLocalActivity(initialCodeCells, activityVariant, extraPythonFiles);

  const pythonAnalyzer = usePythonAnalyzer(
    codeCells.map((cell) => cell.source),
    cellIdx,
    extraPythonFiles,
  );

  const { resetCounter, newReset } = useReset();
  useEffect(() => {
    if (activityResetCounter > 0) {
      newReset();
    }
  }, [newReset, activityResetCounter]);

  const precedingLines = sum(
    codeCells.slice(0, cellIdx).map((cell) => countLines(cell.source)),
  );
  const currentCodeCell = codeCells[cellIdx];
  return localCodeCellsWrongLength ? (
    <InconsistencyMessage />
  ) : (
    <Box marginY={2}>
      {executionFailed && <FailedExecutionSnackbar res={executionFailed} />}
      <CodeCell
        initialSource={initialCodeCells[cellIdx].source}
        currentSource={currentCodeCell.source}
        codeCellExecutionState={codeExecutionStates[cellIdx]}
        onSourceChanged={(newSource) => handleSourceChanged(newSource, cellIdx)}
        onExecutionRequested={() => handleExecute(cellIdx)}
        firstLineNumber={1 + precedingLines}
        activityVariant={activityVariant}
        sourcesUpTo={sourcesUpTo(cellIdx)}
        platformConfig={platformConfig}
        resetCounter={resetCounter}
        extraPythonFiles={extraPythonFiles}
        pythonAnalyzer={pythonAnalyzer}
        extraActions={
          <>
            <SaveToToolboxButton
              sources={sourcesUpTo(cellIdx)}
              originalActivity={activityVariant}
            />
            <MoreOptionsButton
              codeCellState={currentCodeCell}
              codeCellExecutionState={codeExecutionStates[cellIdx]}
              onShowHideOutput={() => handleToggleOutputArea(cellIdx)}
              onReset={() => handleResetSingleCell(cellIdx, newReset)}
            />
          </>
        }
      />
    </Box>
  );
}
