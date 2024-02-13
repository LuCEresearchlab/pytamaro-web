import {
  Alert, AlertTitle, Box, Typography,
} from '@mui/material';
import { sum } from 'lodash';
import { CodeCellState } from '../src/localStorage/schema';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { ActivityVariant, PythonFile } from '../src/schemas/activitySchema';
import { countLines, joinLines } from '../src/sourceUtils';
import CodeCell from './CodeCell';
import MoreOptionsButton from './MoreOptionsButton';
import NetworkErrorSnackbar from './NetworkErrorSnackbar';
import SaveToToolboxButton from './SaveToToolboxButton';

function InconsistencyMessage() {
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      <AlertTitle>Inconsistency Detected</AlertTitle>
      <Typography>
        Code cells saved in your browser do not match the ones in the original notebook.
        This is a mistake on our side.
        Please send us a report using the feedback button.
      </Typography>
      <Typography gutterBottom>
        If you wish to work on this activity, you can delete the code saved in your browser
        using the &ldquo;Reset Activity&rdquo; button in the navigation bar at the top of this page.
        Note that doing this will delete all the code you previosuly wrote for this activity!
      </Typography>
      {process.env.NODE_ENV === 'development' && (
      <Typography fontWeight="bold">
        If you are a content author, either increase the version number of this activity
        or delete the code previously saved in your browser using the reset button.
      </Typography>
      )}
    </Alert>
  );
}

export default function ActivityCodeCell({
  activityVariant, initialCodeCells, cellIdx,
  extraPythonFiles, fullWidthCell, onFullWidthToggle,
} : {
  activityVariant: ActivityVariant,
  initialCodeCells: CodeCellState[],
  cellIdx: number,
  extraPythonFiles: PythonFile[],
  fullWidthCell: boolean,
  onFullWidthToggle: () => void,
}) {
  const {
    codeCells, codeExecutionStates,
    networkError, setNetworkError,
    handleSourceChanged, handleExecute, sourcesUpTo,
    handleToggleOutputArea, handleResetSingleCell,
    localCodeCellsWrongLength,
  } = useLocalActivity(initialCodeCells, activityVariant, extraPythonFiles);
  const precedingLines = sum(codeCells.slice(0, cellIdx).map((cell) => countLines(cell.source)));
  const currentCodeCell = codeCells[cellIdx];
  return localCodeCellsWrongLength ? <InconsistencyMessage /> : (
    <Box marginY={2}>
      <NetworkErrorSnackbar visible={networkError} setVisible={setNetworkError} />
      <CodeCell
        codeCellState={currentCodeCell}
        codeCellExecutionState={codeExecutionStates[cellIdx]}
        onSourceChanged={(newSource) => handleSourceChanged(newSource, cellIdx)}
        onExecutionRequested={() => handleExecute(cellIdx)}
        firstLineNumber={1 + precedingLines}
        activityVariant={activityVariant}
        cumulativeSource={joinLines(sourcesUpTo(cellIdx))}
        extraActions={(
          <>
            <SaveToToolboxButton
              sources={sourcesUpTo(cellIdx)}
              originalActivity={activityVariant}
            />
            <MoreOptionsButton
              codeCellState={currentCodeCell}
              codeCellExecutionState={codeExecutionStates[cellIdx]}
              onShowHideOutput={() => handleToggleOutputArea(cellIdx)}
              onReset={() => handleResetSingleCell(cellIdx)}
              fullWidthCell={fullWidthCell}
              onFullWidthToggle={onFullWidthToggle}
            />
          </>
    )}
      />
    </Box>
  );
}
