import { useActivity } from '../src/localStorage/useActivity';
import { ActivityVariant } from '../src/schemas/activitySchema';
import CodeCell from './CodeCell';

export function initialStateSingleCell(source: string) {
  return [{ source, originalIndex: 0 }];
}

export function emptySingleCell() {
  return initialStateSingleCell('');
}

export default function SolitaryCodeCell({
  activity, activityVariant, readOnly = false,
  postSourceChange = () => { }, extraActions = null,
} :
{ activity: ReturnType<typeof useActivity>,
  activityVariant: ActivityVariant,
  readOnly?: boolean,
  postSourceChange?: (newSource: string) => void,
  extraActions?: React.ReactNode
}) {
  const {
    codeCells, codeExecutionStates,
    handleSourceChanged, handleExecute,
  } = activity;
  return (
    <CodeCell
      codeCellState={codeCells[0]}
      codeCellExecutionState={codeExecutionStates[0]}
      onSourceChanged={(newSource) => {
        handleSourceChanged(newSource, 0);
        postSourceChange(newSource);
      }}
      onExecutionRequested={() => handleExecute(0)}
      firstLineNumber={1}
      activityVariant={activityVariant}
      readOnly={readOnly}
      extraActions={extraActions}
    />
  );
}
