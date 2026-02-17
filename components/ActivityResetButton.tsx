import { isEqual } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import {
  CodeCellState,
  getDefaultActivityVariantMetadata,
} from '../src/localStorage/schema';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  ActivityVariant,
  activityVariantId,
} from '../src/schemas/activitySchema';
import ResetButton from './navbar/ResetButton';

export default function ActivityResetButton({
  activityVariant,
  initialCodeCells,
  newReset,
}: {
  activityVariant: ActivityVariant;
  initialCodeCells: CodeCellState[];
  newReset: () => void;
}) {
  const { cellsModified, handleResetAllCellsNoConfirm } = useLocalActivity(
    initialCodeCells,
    activityVariant,
  );
  const { getActivityMetadata, setActivityMetadata } = useLocalProfile();
  const currentMetadata = getActivityMetadata(activityVariant);
  const defaultMetadata = getDefaultActivityVariantMetadata(
    activityVariantId(activityVariant),
  );
  const metadataModified = !isEqual(currentMetadata, defaultMetadata);

  const { t } = useLocalTranslation(['common']);

  const confirm = useConfirm();
  const handleGlobalReset = () => {
    confirm({
      title: t('resetAreYouSure'),
      description: t('resetActivityWarning'),
      confirmationText: t('resetActivityConfirm'),
      cancellationText: t('confirmCancel'),
    }).then(({ confirmed }) => {
      if (confirmed) {
        handleResetAllCellsNoConfirm();
        newReset();
        setActivityMetadata(activityVariant, defaultMetadata);
      }
    });
  };

  return (
    <ResetButton
      enabled={cellsModified || metadataModified}
      onReset={handleGlobalReset}
      tooltip={t('resetActivity')}
    />
  );
}
