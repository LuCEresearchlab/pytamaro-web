import {
  Button,
} from '@mui/material';
import { useState } from 'react';
import { ToolboxFunction } from '../src/localStorage/schema';
import CustomSnackbar from './CustomSnackbar';
import SaveToToolboxDialog from './SaveToToolboxDialog';

export default function EditToolboxFunctionButton({ toolboxFunction } :
{ toolboxFunction: ToolboxFunction }) {
  const [open, setOpen] = useState(false);
  const [savingSuccess, setSavingSuccess] = useState(false);
  const [savingError, setSavingError] = useState(false);

  return (
    <>
      <Button
        color="warning"
        variant="contained"
        onClick={() => setOpen(true)}
      >
        Edit Function
      </Button>
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
      <CustomSnackbar
        visible={savingSuccess}
        setVisible={setSavingSuccess}
        severity="success"
        message="Function successfully edited!"
      />
      <CustomSnackbar
        visible={savingError}
        setVisible={setSavingError}
        severity="error"
        message="Could not find the function to edit in your toolbox!"
      />
    </>
  );
}
