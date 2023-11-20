import { Construction } from '@mui/icons-material';
import {
  IconButton, Tooltip,
} from '@mui/material';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { PythonFunction, defined_functions } from '../src/python-analyzer/python_analyzer';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import CustomSnackbar from './CustomSnackbar';
import SaveToToolboxDialog from './SaveToToolboxDialog';

export default function SaveToToolboxButton({ sources, originalActivity } :
{ sources: string[], originalActivity: ActivityVariant }) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(false);
  const [savingSuccess, setSavingSuccess] = useState(false);
  const [savingError, setSavingError] = useState(false);

  const selectedCellSource = sources[sources.length - 1];
  const implementation = joinLines(sources);

  const debouncedFindFunctionsDefinitions = useMemo(() => {
    const findFunctionDefinitions = async (currentCellSource: string) => {
      try {
        const newFunctions : PythonFunction[] = await defined_functions(currentCellSource);
        const atLeastOneFunction = newFunctions.length > 0;
        setAvailable(atLeastOneFunction);
      } catch (e) {
        setAvailable(false);
      }
    };

    return debounce(findFunctionDefinitions, 100);
  }, []);

  useEffect(() => {
    debouncedFindFunctionsDefinitions(selectedCellSource);
  }, [selectedCellSource, debouncedFindFunctionsDefinitions]);

  if (!available) {
    return null;
  }
  return (
    <>
      <Tooltip arrow title="Save a function to toolbox">
        <IconButton
          onClick={() => setOpen(true)}
          className="save-to-toolbox-dialog-button"
        >
          <Construction />
        </IconButton>
      </Tooltip>
      <SaveToToolboxDialog
        open={open}
        onClose={() => setOpen(false)}
        externalImplementation={implementation}
        originalActivity={originalActivity}
        setSavingSuccess={setSavingSuccess}
        setSavingError={setSavingError}
      />
      <CustomSnackbar
        visible={savingSuccess}
        setVisible={setSavingSuccess}
        severity="success"
        message="Function successfully saved to the toolbox!"
      />
      <CustomSnackbar
        visible={savingError}
        setVisible={setSavingError}
        severity="error"
        message="Saving failed: this name already exists in the toolbox!"
      />
    </>
  );
}
