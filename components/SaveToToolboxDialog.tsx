import {
  Alert, Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl, InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ExecutionResponse, TOOLBOX_FILE } from '../src/codeExecution';
import { CodeCellState, ToolboxFunction } from '../src/localStorage/schema';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import useTemporaryActivity from '../src/localStorage/useTemporaryActivity';
import { PythonFunction, defined_functions } from '../src/python-analyzer/python_analyzer';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { toolboxActivityVariant } from '../src/specialActivities';
import { isExecutionError } from './CodeCell';
import CodeEditor from './CodeEditor';
import CustomSnackbar from './CustomSnackbar';
import SolitaryCodeCell, { emptySingleCell, initialStateSingleCell } from './SolitaryCodeCell';

function PermanentlySaveToToolboxButton({
  fn, enabled, saved, setSaved,
} : {
  fn: ToolboxFunction,
  enabled: boolean,
  saved: boolean,
  setSaved: (saved: boolean) => void
}) {
  const [savingSuccess, setSavingSuccess] = useState(false);
  const [savingError, setSavingError] = useState(false);
  const { add } = useLocalToolbox();
  const saveFunction = () => {
    if (add(fn)) {
      setSavingSuccess(true);
      setSaved(true);
    } else {
      setSavingError(true);
    }
  };
  return (
    <>
      <Box textAlign="center">
        <Button
          onClick={() => saveFunction()}
          disabled={!enabled || saved}
          color="primary"
          variant="contained"
          sx={{ marginTop: 2, minWidth: '30ch' }}
        >
          {saved ? 'Saved' : 'Save to toolbox'}
        </Button>
      </Box>
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

function SelectFunction({ functions, selectedFunction, setSelectedFunction } :
{ functions: PythonFunction[],
  selectedFunction: string,
  setSelectedFunction: (fn: string) => void }) {
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedFunction(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: '15ch' }} size="small">
      <InputLabel id="select-function-label">Function</InputLabel>
      <Select
        labelId="select-function-label"
        id="select-function"
        value={selectedFunction}
        label="Function"
        onChange={handleChange}
      >
        {functions.map((f) => (
          <MenuItem key={f.name} value={f.name}>{f.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function functionForToolbox(
  fn: PythonFunction,
  implementation: string,
  description: string,
  originalActivity: ActivityVariant,
  usage: string = '',
) {
  return {
    name: fn.name,
    args: fn.args.map(({ name, type_str }) => ({ name, typeUnparsed: type_str })),
    returnTypeUnparsed: fn.return_type_str,
    description,
    originalActivity,
    source: implementation,
    usage,
  };
}

export default function FunctionsDialog({
  open, onClose, initialImplementation, originalActivity,
}:
{ open: boolean, onClose: () => void, initialImplementation: string,
  originalActivity: ActivityVariant }) {
  const [implementation, setImplementation] = useState(initialImplementation);
  const initialCodeCells = initialStateSingleCell(implementation);
  const [codeCells, setCodeCells] = useState<CodeCellState[]>(initialCodeCells);
  const [functions, setFunctions] = useState<PythonFunction[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [description, setDescription] = useState('');
  const [usageExecutedSuccessfully, setUsageExecutedSuccessfully] = useState(false);
  const [saved, setSaved] = useState(false);
  const selectedPythonFunction = functions.find((f) => f.name === selectedFunction);
  const { exists } = useLocalToolbox();
  const alreadyExists = exists(selectedFunction);

  const preExecute = () => {
    if (selectedPythonFunction) {
      return functionForToolbox(
        selectedPythonFunction,
        implementation,
        description,
        originalActivity,
      );
    }
    return undefined;
  };

  const postExecuteSingleCell = (idx: number, response: ExecutionResponse | undefined) => {
    if (idx === 0) {
      setUsageExecutedSuccessfully(!isExecutionError(response));
    }
  };

  const activity = useTemporaryActivity(
    emptySingleCell(),
    codeCells,
    setCodeCells,
    toolboxActivityVariant,
    preExecute,
    postExecuteSingleCell,
  );

  useEffect(() => {
    setImplementation(initialImplementation);
    setCodeCells(initialStateSingleCell(initialImplementation));
  }, [initialImplementation]);

  useEffect(() => {
    const findNewFunctions = async () => {
      try {
        const newFunctions : PythonFunction[] = await defined_functions(implementation);
        setFunctions(newFunctions);
      } catch (e) {
        setFunctions([]);
      }
    };
    findNewFunctions();
  }, [implementation]);

  const initUsage = (newSelectedFn: string) => {
    if (newSelectedFn && newSelectedFn !== selectedFunction) {
      const newUsage = joinLines([`from ${TOOLBOX_FILE} import ${newSelectedFn}`, '...']);
      activity.handleSourceChanged(newUsage, 0);
      setUsageExecutedSuccessfully(false);
    }
  };

  const handleImplementationChange = (newImplementation: string) => {
    setImplementation(newImplementation);
    setSelectedFunction('');
    setUsageExecutedSuccessfully(false);
  };

  return (
    <Dialog onClose={() => onClose()} open={open} maxWidth="md" fullWidth>
      <DialogTitle>Save a function to my toolbox</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" fontWeight="bold" marginBottom={2}>
          Implementation
        </Typography>
        <CodeEditor
          source={implementation}
          onChange={handleImplementationChange}
        />
        <Box marginTop={4} />
        {functions.length > 0 ? (
          <>
            <Stack direction="row" spacing="2ch" alignItems="baseline" marginBottom={2}>
              <Typography color="text.secondary" minWidth="max-content" fontWeight="bold">
                Function to save
              </Typography>
              <SelectFunction
                functions={functions}
                selectedFunction={selectedFunction}
                setSelectedFunction={(newSelectedFn) => {
                  initUsage(newSelectedFn);
                  setSelectedFunction(newSelectedFn);
                }}
              />
              <TextField
                variant="filled"
                size="small"
                helperText="Document what this function does"
                inputProps={{ sx: { pt: 0 } }}
                FormHelperTextProps={{ sx: { textAlign: 'center' } }}
                fullWidth
                value={description}
                onChange={(event : React.ChangeEvent<HTMLInputElement>) => {
                  setDescription(event.target.value);
                }}
              />
            </Stack>
            {!selectedFunction && (
              <Alert severity="info">Select a function to save</Alert>
            )}
            {alreadyExists && !saved && (
              <Alert severity="error">The toolbox already contains this name!</Alert>
            )}
            {selectedFunction && (!alreadyExists || saved) && (!description ? (
              <Alert severity="info">Add a description so that you will remember what this function does</Alert>
            ) : (
              <>
                <Typography color="text.secondary" marginTop={2} marginBottom={2} fontWeight="bold">
                  Example that uses this function
                </Typography>
                <SolitaryCodeCell
                  activity={activity}
                  activityVariant={toolboxActivityVariant}
                />
              </>
            ))}
            {selectedPythonFunction && description && (
            <>
              {!usageExecutedSuccessfully && (
              <Alert sx={{ mt: 2 }} severity="info">Run the usage example to make sure the function works as you expect</Alert>
              )}
              <PermanentlySaveToToolboxButton
                fn={functionForToolbox(
                  selectedPythonFunction,
                  implementation,
                  description,
                  originalActivity,
                  activity.codeCells[0].source,
                )}
                enabled={usageExecutedSuccessfully}
                saved={saved}
                setSaved={setSaved}
              />
            </>
            )}
          </>
        ) : (
          <Alert severity="error">No function definitions found (possibly due to a syntax error)</Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
