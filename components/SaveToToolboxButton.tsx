import Construction from '@mui/icons-material/Construction';
import { IconButton, Tooltip } from '@mui/material';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import {
  AnalysisResult,
  analyze,
} from '../src/python-analyzer/python_analyzer';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import CustomSnackbar from './CustomSnackbar';
import SaveToToolboxDialog from './SaveToToolboxDialog';

export default function SaveToToolboxButton({
  sources,
  originalActivity,
}: {
  sources: string[];
  originalActivity: ActivityVariant;
}) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(false);
  const [savingSuccess, setSavingSuccess] = useState(false);
  const [savingError, setSavingError] = useState(false);

  const selectedCellSource = sources[sources.length - 1];
  const implementation = joinLines(sources);

  const debouncedFindFunctionsDefinitions = useMemo(() => {
    const findFunctionDefinitions = async (currentCellSource: string) => {
      const analysisResult: AnalysisResult = await analyze(currentCellSource);
      const newFunctions = analysisResult.defined_functions;
      const atLeastOneFunction = newFunctions.length > 0;
      const noErrors = analysisResult.parse_errors.length === 0;
      setAvailable(atLeastOneFunction && noErrors);
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
      <Tooltip arrow title='Save a function to toolbox'>
        <IconButton
          onClick={() => setOpen(true)}
          className='save-to-toolbox-dialog-button'
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
        severity='success'
        message='Function successfully saved to the toolbox!'
      />
      <CustomSnackbar
        visible={savingError}
        setVisible={setSavingError}
        severity='error'
        message='Saving failed: this name already exists in the toolbox!'
      />
    </>
  );
}
