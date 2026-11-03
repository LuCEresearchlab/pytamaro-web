import Construction from '@mui/icons-material/Construction';
import { IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import type { ActivityVariant } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import useAnalysisResult from '../src/useAnalysisResult';
import type { ActivitySession } from '../src/activitySession';
import CustomSnackbar from './CustomSnackbar';
import SaveToToolboxDialog from './SaveToToolboxDialog';

export default function SaveToToolboxButton({
  activitySession,
  cellIdx,
  originalActivity,
}: {
  activitySession: ActivitySession;
  cellIdx: number;
  originalActivity: ActivityVariant;
}) {
  const { t } = useLocalTranslation();
  const [open, setOpen] = useState(false);
  const [savingSuccess, setSavingSuccess] = useState(false);
  const [savingError, setSavingError] = useState(false);

  const analysisResult = useAnalysisResult(activitySession, cellIdx);
  const sources = activitySession.getSourcesUpTo(cellIdx);
  const implementation = joinLines(sources);
  const functionsThisCell = activitySession.functionsDefinedInCell(cellIdx);
  const atLeastOneFunction = functionsThisCell.length > 0;
  const noErrors = analysisResult?.parse_errors.length === 0;
  const enabled = atLeastOneFunction && noErrors;

  if (!enabled) {
    return null;
  }
  return (
    <>
      <Tooltip arrow title={t('toolbox.saveToToolboxTooltip')}>
        <IconButton
          onClick={() => setOpen(true)}
          className='save-to-toolbox-dialog-button'
        >
          <Construction />
        </IconButton>
      </Tooltip>
      {open && (
        <SaveToToolboxDialog
          open={open}
          onClose={() => setOpen(false)}
          externalImplementation={implementation}
          originalActivity={originalActivity}
          setSavingSuccess={setSavingSuccess}
          setSavingError={setSavingError}
        />
      )}
      <CustomSnackbar
        visible={savingSuccess}
        setVisible={setSavingSuccess}
        severity='success'
        message={t('toolbox.successfullySaved')}
      />
      <CustomSnackbar
        visible={savingError}
        setVisible={setSavingError}
        severity='error'
        message={t('toolbox.failedSavingNameExists')}
      />
    </>
  );
}
