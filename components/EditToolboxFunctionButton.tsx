import { Button } from '@mui/material';
import { useState } from 'react';
import { ToolboxFunction } from '../src/localStorage/schema';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import CustomSnackbar from './CustomSnackbar';
import SaveToToolboxDialog from './SaveToToolboxDialog';

export default function EditToolboxFunctionButton({
  toolboxFunction,
}: {
  toolboxFunction: ToolboxFunction;
}) {
  const { t } = useLocalTranslation();
  const [open, setOpen] = useState(false);
  const [savingSuccess, setSavingSuccess] = useState(false);
  const [savingError, setSavingError] = useState(false);

  return (
    <>
      <Button color='warning' variant='contained' onClick={() => setOpen(true)}>
        {t('toolbox.editFunction')}
      </Button>
      {open && (
        <SaveToToolboxDialog
          open={open}
          onClose={() => setOpen(false)}
          replaceExistingFunction
          externalImplementation={toolboxFunction.source}
          initialName={toolboxFunction.name}
          initialDescription={toolboxFunction.description}
          initialUsage={toolboxFunction.usage}
          originalActivity={toolboxFunction.originalActivity}
          setSavingSuccess={setSavingSuccess}
          setSavingError={setSavingError}
        />
      )}
      <CustomSnackbar
        visible={savingSuccess}
        setVisible={setSavingSuccess}
        severity='success'
        message={t('toolbox.successfullyEdited')}
      />
      <CustomSnackbar
        visible={savingError}
        setVisible={setSavingError}
        severity='error'
        message={t('toolbox.failedEditingNameExists')}
      />
    </>
  );
}
