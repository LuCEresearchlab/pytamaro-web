import { isEqual } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import { CodeCellState, getDefaultActivityVariantMetadata } from '../src/localStorage/schema';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { ActivityVariant, activityVariantId } from '../src/schemas/activitySchema';
import ResetButton from './ResetButton';

export default function ActivityResetButton({ activityVariant, initialCodeCells } : {
  activityVariant: ActivityVariant,
  initialCodeCells: CodeCellState[],
}) {
  const {
    cellsModified,
    handleResetAllCellsNoConfirm,
  } = useLocalActivity(initialCodeCells, activityVariant);
  const { getActivityMetadata, setActivityMetadata } = useLocalProfile();
  const currentMetadata = getActivityMetadata(activityVariant);
  const defaultMetadata = getDefaultActivityVariantMetadata(activityVariantId(activityVariant));
  const metadataModified = !isEqual(currentMetadata, defaultMetadata);

  const confirm = useConfirm();
  const handleGlobalReset = () => {
    confirm({ description: 'You are about to reset the entire activity, including all the code you have written. This action cannot be undone! ⚠️', confirmationText: 'Ok, delete my code' })
      .then(() => {
        handleResetAllCellsNoConfirm();
        setActivityMetadata(activityVariant, defaultMetadata);
      });
  };

  return <ResetButton enabled={cellsModified || metadataModified} onReset={handleGlobalReset} tooltip="Reset Activity" />;
}
