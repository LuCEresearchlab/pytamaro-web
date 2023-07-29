import { Alert, AlertTitle, Typography } from '@mui/material';
import { sum } from 'lodash';
import { CodeCellState } from '../src/localStorage/schema';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { countLines } from '../src/sourceUtils';
import CodeCell from './CodeCell';
import MoreOptionsButton from './MoreOptionsButton';
import SaveToToolboxButton from './SaveToToolboxButton';

function InconsistencyMessage() {
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      <AlertTitle>Inconsistency Detected</AlertTitle>
      <Typography>
        Code cells saved in your browser do not match the ones in the original notebook.
        This should not happen.
      </Typography>
      <Typography gutterBottom>
        Please send us a report using the feedback button.
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

export default function ActivityCodeCell({ activityVariant, initialCodeCells, cellIdx } : {
  activityVariant: ActivityVariant,
  initialCodeCells: CodeCellState[],
  cellIdx: number,
}) {
  const {
    codeCells, codeExecutionStates,
    handleSourceChanged, handleExecute, sourcesUpTo,
    handleToggleOutputArea, handleResetSingleCell,
    localCodeCellsWrongLength,
  } = useLocalActivity(initialCodeCells, activityVariant);
  const precedingLines = sum(codeCells.slice(0, cellIdx).map((cell) => countLines(cell.source)));
  const currentCodeCell = codeCells[cellIdx];
  return localCodeCellsWrongLength ? <InconsistencyMessage /> : (
    <CodeCell
      codeCellState={currentCodeCell}
      codeCellExecutionState={codeExecutionStates[cellIdx]}
      onSourceChanged={(newSource) => handleSourceChanged(newSource, cellIdx)}
      onExecutionRequested={() => handleExecute(cellIdx)}
      firstLineNumber={1 + precedingLines}
      activityVariant={activityVariant}
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
          />
        </>
    )}
    />
  );
}
