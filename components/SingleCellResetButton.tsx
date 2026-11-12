import { useConfirm } from 'material-ui-confirm';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import type { ActivityState } from '../src/useActivity';
import ResetButton from './navbar/ResetButton';

export default function SingleCellResetButton({
  activityState,
  newReset,
  subject,
  tooltip,
}: {
  activityState: ActivityState;
  newReset: () => void;
  subject: string;
  tooltip: string;
}) {
  const { cellsModified, handleResetAllCellsNoConfirm } = activityState;
  const { t } = useLocalTranslation(['common']);
  const confirm = useConfirm();

  const handleReset = () => {
    confirm({
      title: t('resetAreYouSure'),
      description: t('resetSingleCellWarning', { subject }),
      confirmationText: t('resetActivityConfirm'),
      cancellationText: t('confirmCancel'),
    }).then(({ confirmed }) => {
      if (confirmed) {
        handleResetAllCellsNoConfirm();
        newReset();
      }
    });
  };

  return (
    <ResetButton
      enabled={cellsModified}
      onReset={handleReset}
      tooltip={tooltip}
    />
  );
}
