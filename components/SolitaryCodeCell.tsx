import { useActivity } from '../src/localStorage/useActivity';
import { ActivityVariant } from '../src/schemas/activitySchema';
import CodeCell from './CodeCell';

export function initialStateSingleCell(source: string) {
  return [{ source, originalIndex: 0 }];
}

export function emptySingleCell() {
  return initialStateSingleCell('');
}

export default function SolitaryCodeCell({ activity, activityVariant } :
{ activity: ReturnType<typeof useActivity>, activityVariant: ActivityVariant }) {
  const {
    codeCells, codeExecutionStates,
    handleSourceChanged, handleExecute,
  } = activity;
  return (
    <CodeCell
      codeCellState={codeCells[0]}
      codeCellExecutionState={codeExecutionStates[0]}
      onSourceChanged={(newSource) => handleSourceChanged(newSource, 0)}
      onExecutionRequested={() => handleExecute(0)}
      firstLineNumber={1}
      activityVariant={activityVariant}
    />
  );
}
