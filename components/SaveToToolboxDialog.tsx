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
import { PythonFunction, defined_functions } from '../src/python-analyzer/python_analyzer';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { toolboxActivityVariant } from '../src/specialActivities';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import theme from '../src/theme';
import { toolboxFunctionPathname } from '../src/urlUtils';
import useTemporaryActivity from '../src/useTemporaryActivity';
import { isExecutionError } from './CodeCell';
import CodeEditor from './CodeEditor';
import SolitaryCodeCell, { initialStateSingleCell } from './SolitaryCodeCell';

function PermanentlySaveToToolboxButton({
  fn, replace, enabled, onSave, setSavingSuccess, setSavingError,
} : {
  fn: ToolboxFunction,
  replace: boolean,
  enabled: boolean,
  onSave: () => void,
  setSavingSuccess: Dispatch<SetStateAction<boolean>>,
  setSavingError: Dispatch<SetStateAction<boolean>>,
}) {
  const { metadata } = useLocalProfile();
  const { add, replaceFunction } = useLocalToolbox();
  const saveFunction = () => {
    const result = replace ? replaceFunction(fn) : add(fn);
    if (result) {
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
        {replace ? 'Save edited function' : 'Save to toolbox'}
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
  open, onClose, replaceExistingFunction = false,
  externalImplementation, initialName = undefined, initialDescription = undefined,
  initialUsage = undefined, originalActivity, setSavingSuccess, setSavingError,
}:
{ open: boolean, onClose: () => void, replaceExistingFunction?: boolean,
  externalImplementation: string, initialName?: string, initialDescription?: string,
  initialUsage?: string, originalActivity: ActivityVariant,
  setSavingSuccess: Dispatch<SetStateAction<boolean>>,
  setSavingError: Dispatch<SetStateAction<boolean>>
}) {
  const [implementation, setImplementation] = useState(externalImplementation);
  const [functions, setFunctions] = useState<PythonFunction[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>(initialName || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [usageExecutedSuccessfully, setUsageExecutedSuccessfully] = useState(false);
  const [usageEdited, setUsageEdited] = useState(false);
  const [invalidUsageExecution, setInvalidUsageExecution] = useState(false);
  const selectedPythonFunction = functions.find((f) => f.name === selectedFunction);
  const replacingFunctionFound = functions.some((f) => f.name === initialName);
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

  useEffect(() => {
    setImplementation(externalImplementation);
  }, [externalImplementation]);

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

  const initialCodeCells = initialStateSingleCell(initialUsage || '');
  const [codeCells, setCodeCells] = useState<CodeCellState[]>(initialCodeCells);
  const activity = useTemporaryActivity(
    initialCodeCells,
    codeCells,
    setCodeCells,
    toolboxActivityVariant,
    preExecute,
    postExecuteSingleCell,
  );

  const initUsage = (newSelectedFn: string) => {
    // Do not overwrite the usage if the user has edited it at least once in the past
    if (newSelectedFn && newSelectedFn !== selectedFunction && !usageEdited) {
      const newUsage = joinLines([`from ${TOOLBOX_FILE} import ${newSelectedFn}`, 'from pytamaro import _', '', '...']);
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
    setUsageExecutedSuccessfully(false);
    setInvalidUsageExecution(true);
    if (!replaceExistingFunction) {
      resetSelectedFunction();
    }
  };

  return (
    <Dialog onClose={() => onClose()} open={open} maxWidth="md" fullWidth>
      <DialogTitle>
        {replaceExistingFunction ? 'Edit Toolbox Function' : 'Save Function to Toolbox'}
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
        {!replaceExistingFunction && (
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
        )}
        <CodeEditor
          source={implementation}
          onChange={handleImplementationChange}
        />
        <Box marginTop={4} />
        {functions.length > 0 ? (
          <>
            <Stack direction="row" spacing="2ch" alignItems="baseline" marginBottom={2}>
              <Typography color="text.secondary" minWidth="max-content" fontWeight="bold">
                Function to
                {' '}
                {replaceExistingFunction ? 'edit' : 'save'}
              </Typography>
              {replaceExistingFunction ? (
                <Typography color="text.secondary" fontWeight="bold" fontFamily={theme.pytamaro.monospaceFontFamily}>
                  {initialName}
                </Typography>
              ) : (
                <SelectFunction
                  functions={functions}
                  selectedFunction={selectedFunction}
                  setSelectedFunction={(newSelectedFn) => {
                    initUsage(newSelectedFn);
                    setSelectedFunction(newSelectedFn);
                  }}
                />
              )}
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
            {alreadyExists && !replaceExistingFunction && (
              <Alert severity="error">
                The toolbox already contains this name. Refactor the code to change its name or
                {' '}
                <Link href={toolboxFunctionPathname(selectedFunction)} target="_blank">
                  delete the existing one from the toolbox
                </Link>
                .
              </Alert>
            )}
            {replaceExistingFunction && !replacingFunctionFound && (
              <Alert severity="error">
                The implementation above does not define anymore
                the function you are trying to edit.
              </Alert>
            )}
            {selectedFunction && (!alreadyExists || replaceExistingFunction) && (!description ? (
              <Alert severity="info">Add a description so that you will remember what this function does</Alert>
            ) : (
              <div id="usage">
                <Typography color="text.secondary" marginTop={2} marginBottom={2} fontWeight="bold">
                  Example that uses this function
                </Typography>
                <SolitaryCodeCell
                  activity={activity}
                  activityVariant={toolboxActivityVariant}
                  requireNewExecution={invalidUsageExecution}
                  postSourceChange={() => {
                    setUsageEdited(true);
                    setUsageExecutedSuccessfully(false);
                  }}
                  onExecutionRequest={() => {
                    setInvalidUsageExecution(false);
                  }}
                />
              </div>
            ))}
            {selectedPythonFunction && (!alreadyExists || replaceExistingFunction)
            && description && (
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
                replace={replaceExistingFunction}
                enabled={usageExecutedSuccessfully}
                onSave={() => {
                  if (!replaceExistingFunction) {
                    resetSelectedFunction(); resetDescription();
                  }
                  onClose();
                }}
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
