import { isEqual } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import { getDefaultActivityVariantMetadata } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  ActivityVariant,
  activityVariantId,
} from '../src/schemas/activitySchema';
import type { ActivityState } from '../src/useActivity';
import ResetButton from './navbar/ResetButton';

export default function ActivityResetButton({
  activityState,
  activityVariant,
  newReset,
}: {
  activityState: ActivityState;
  activityVariant: ActivityVariant;
  newReset: () => void;
}) {
  const { cellsModified, handleResetAllCellsNoConfirm } = activityState;
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
      testId='reset-activity'
    />
  );
}
