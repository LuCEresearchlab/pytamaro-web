/* eslint-disable react/no-unescaped-entities */
import { Close } from '@mui/icons-material';
import {
  Alert, Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl, IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Dispatch, SetStateAction, useEffect, useState,
} from 'react';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import { ExecutionResponse, TOOLBOX_FILE } from '../src/codeExecution';
import { CodeCellState, ToolboxFunction } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import useTemporaryActivity from '../src/localStorage/useTemporaryActivity';
import { PythonFunction, defined_functions } from '../src/python-analyzer/python_analyzer';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { toolboxActivityVariant } from '../src/specialActivities';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import theme from '../src/theme';
import { toolboxFunctionPathname } from '../src/urlUtils';
import { isExecutionError } from './CodeCell';
import CodeEditor from './CodeEditor';
import SolitaryCodeCell, { emptySingleCell, initialStateSingleCell } from './SolitaryCodeCell';

function PermanentlySaveToToolboxButton({
  fn, enabled, onSave, setSavingSuccess, setSavingError,
} : {
  fn: ToolboxFunction,
  enabled: boolean,
  onSave: () => void,
  setSavingSuccess: Dispatch<SetStateAction<boolean>>,
  setSavingError: Dispatch<SetStateAction<boolean>>,
}) {
  const { metadata } = useLocalProfile();
  const { add } = useLocalToolbox();
  const saveFunction = () => {
    if (add(fn)) {
      logAnalyticsEvent(AnalyticsEventName.AddToolboxFunction, { name: fn.name });
      storeDbEvent(EventName.AddToolboxFunction, metadata, { fn });
      setSavingSuccess(true);
    } else {
      setSavingError(true);
    }
    onSave();
  };
  return (
    <Box textAlign="center">
      <Button
        onClick={() => saveFunction()}
        disabled={!enabled}
        color="primary"
        variant="contained"
        sx={{ marginTop: 2, minWidth: '30ch' }}
        className="save-to-toolbox-button"
      >
        Save to toolbox
      </Button>
    </Box>
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

export default function SaveToToolboxDialog({
  open, onClose, initialImplementation, originalActivity, setSavingSuccess, setSavingError,
}:
{ open: boolean, onClose: () => void, initialImplementation: string,
  originalActivity: ActivityVariant,
  setSavingSuccess: Dispatch<SetStateAction<boolean>>,
  setSavingError: Dispatch<SetStateAction<boolean>>
}) {
  const [implementation, setImplementation] = useState(initialImplementation);
  const initialCodeCells = initialStateSingleCell(implementation);
  const [codeCells, setCodeCells] = useState<CodeCellState[]>(initialCodeCells);
  const [functions, setFunctions] = useState<PythonFunction[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [description, setDescription] = useState('');
  const [usageExecutedSuccessfully, setUsageExecutedSuccessfully] = useState(false);
  const [usageEdited, setUsageEdited] = useState(false);
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
    // Do not overwrite the usage if the user has edited it at least once in the past
    if (newSelectedFn && newSelectedFn !== selectedFunction && !usageEdited) {
      const newUsage = joinLines([`from ${TOOLBOX_FILE} import ${newSelectedFn}`, '...']);
      activity.handleSourceChanged(newUsage, 0);
      setUsageExecutedSuccessfully(false);
    }
  };

  const resetSelectedFunction = () => {
    setSelectedFunction('');
  };

  const resetDescription = () => {
    setDescription('');
  };

  const handleImplementationChange = (newImplementation: string) => {
    setImplementation(newImplementation);
    resetSelectedFunction();
    setUsageExecutedSuccessfully(false);
  };

  return (
    <Dialog onClose={() => onClose()} open={open} maxWidth="md" fullWidth>
      <DialogTitle>
        Save a function to my toolbox
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" fontWeight="bold" marginBottom={2}>
          Implementation
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Clean up your code before saving a function to the toolbox. Here are some tips:
          <ul style={{
            marginTop: theme.spacing(1),
            marginBottom: 0,
            paddingInlineStart: theme.spacing(2),
          }}
          >
            <li> Remove any code that is not needed by the function you want to save </li>
            <li>
              {' '}
              Remove calls that produce output (e.g., calls to
              {' '}
              <code>print</code>
              {' '}
              or
              {' '}
              <code>show_graphic</code>
              )
              {' '}
            </li>
            <li>
              Remove unnecessary imports (move them all to the top,
              combine them and get rid of unneeded ones)
            </li>
          </ul>
        </Alert>
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
                className="function-description"
              />
            </Stack>
            {alreadyExists && (
              <Alert severity="error">
                The toolbox already contains this name. Refactor the code to change its name or
                {' '}
                <Link href={toolboxFunctionPathname(selectedFunction)} target="_blank">
                  delete the existing one from the toolbox
                </Link>
                .
              </Alert>
            )}
            {selectedFunction && !alreadyExists && (!description ? (
              <Alert severity="info">Add a description so that you will remember what this function does</Alert>
            ) : (
              <>
                <Typography color="text.secondary" marginTop={2} marginBottom={2} fontWeight="bold">
                  Example that uses this function
                </Typography>
                <SolitaryCodeCell
                  activity={activity}
                  activityVariant={toolboxActivityVariant}
                  postSourceChange={() => {
                    setUsageEdited(true);
                    setUsageExecutedSuccessfully(false);
                  }}
                />
              </>
            ))}
            {selectedPythonFunction && !alreadyExists && description && (
            <>
              {!usageExecutedSuccessfully && (
              <Alert sx={{ mt: 2 }} severity="info">
                Run the usage example to make sure the function works as you expect.
                Don't forget to add all the necessary imports.
              </Alert>
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
                onSave={() => { resetSelectedFunction(); resetDescription(); onClose(); }}
                setSavingSuccess={setSavingSuccess}
                setSavingError={setSavingError}
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
