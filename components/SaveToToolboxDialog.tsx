/* eslint-disable react/no-unescaped-entities */
import Close from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Trans } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import logAnalyticsEvent, { AnalyticsEventName } from '../src/analyticsEvent';
import { ExecutionResponse, TOOLBOX_FILE } from '../src/codeExecution';
import { CodeCellState, ToolboxFunction } from '../src/localStorage/schema';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  analyze,
  PythonFunction,
} from '../src/python-analyzer/python_analyzer';
import { ActivityVariant } from '../src/schemas/activitySchema';
import { joinLines } from '../src/sourceUtils';
import { toolboxActivityVariant } from '../src/specialActivities';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import theme from '../src/theme';
import { toolboxFunctionPathname } from '../src/urlUtils';
import usePythonAnalyzer from '../src/usePythonAnalyzer';
import useTemporaryActivity from '../src/useTemporaryActivity';
import { isExecutionError } from './CodeCell';
import CodeEditor from './CodeEditor';
import SolitaryCodeCell, { initialStateSingleCell } from './SolitaryCodeCell';

function PermanentlySaveToToolboxButton({
  fn,
  replace,
  enabled,
  onSave,
  setSavingSuccess,
  setSavingError,
}: {
  fn: ToolboxFunction;
  replace: boolean;
  enabled: boolean;
  onSave: () => void;
  setSavingSuccess: Dispatch<SetStateAction<boolean>>;
  setSavingError: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useLocalTranslation();
  const { metadata } = useLocalProfile();
  const { add, replaceFunction } = useLocalToolbox();
  const saveFunction = () => {
    const result = replace ? replaceFunction(fn) : add(fn);
    if (result) {
      logAnalyticsEvent(AnalyticsEventName.AddToolboxFunction, {
        name: fn.name,
      });
      storeDbEvent(EventName.AddToolboxFunction, metadata, { fn });
      setSavingSuccess(true);
    } else {
      setSavingError(true);
    }
    onSave();
  };
  return (
    <Box textAlign='center'>
      <Button
        onClick={() => saveFunction()}
        disabled={!enabled}
        color='primary'
        variant='contained'
        sx={{ marginTop: 2, minWidth: '30ch' }}
        className='save-to-toolbox-button'
      >
        {replace ? t('toolbox.saveButtonEdited') : t('toolbox.saveButton')}
      </Button>
    </Box>
  );
}

function SelectFunction({
  functions,
  selectedFunction,
  setSelectedFunction,
}: {
  functions: PythonFunction[];
  selectedFunction: string;
  setSelectedFunction: (fn: string) => void;
}) {
  const { t } = useLocalTranslation();
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedFunction(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: '15ch' }} size='small'>
      <InputLabel id='select-function-label'>{t('Function')}</InputLabel>
      <Select
        labelId='select-function-label'
        id='select-function'
        value={selectedFunction}
        label={t('Function')}
        onChange={handleChange}
      >
        {functions.map((f) => (
          <MenuItem key={f.name} value={f.name}>
            {f.name}
          </MenuItem>
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
): ToolboxFunction {
  return {
    name: fn.name,
    args: fn.args.map(({ name, type_str }) => ({
      name,
      typeUnparsed: type_str,
    })),
    returnTypeUnparsed: fn.return_type_str,
    description,
    originalActivity,
    source: implementation,
    usage,
  };
}

export default function SaveToToolboxDialog({
  open,
  onClose,
  replaceExistingFunction = false,
  externalImplementation,
  initialName = undefined,
  initialDescription = undefined,
  initialUsage = undefined,
  originalActivity,
  setSavingSuccess,
  setSavingError,
}: {
  open: boolean;
  onClose: () => void;
  replaceExistingFunction?: boolean;
  externalImplementation: string;
  initialName?: string;
  initialDescription?: string;
  initialUsage?: string;
  originalActivity: ActivityVariant;
  setSavingSuccess: Dispatch<SetStateAction<boolean>>;
  setSavingError: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useLocalTranslation();
  const [implementation, setImplementation] = useState(externalImplementation);
  const [functions, setFunctions] = useState<PythonFunction[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>(
    initialName || '',
  );
  const [description, setDescription] = useState(initialDescription || '');
  const [usage, setUsage] = useState(initialUsage || '');
  const [usageExecutedSuccessfully, setUsageExecutedSuccessfully] =
    useState(false);
  const [usageEdited, setUsageEdited] = useState(false);
  const [invalidUsageExecution, setInvalidUsageExecution] = useState(false);
  const selectedPythonFunction = functions.find(
    (f) => f.name === selectedFunction,
  );
  const replacingFunctionFound = functions.some((f) => f.name === initialName);
  const { exists } = useLocalToolbox();
  const alreadyExists = exists(selectedFunction);

  const newToolboxFunction =
    selectedPythonFunction &&
    functionForToolbox(
      selectedPythonFunction,
      implementation,
      description,
      originalActivity,
    );

  const getExtraToolboxFunction = () => {
    return newToolboxFunction;
  };

  const implementationPythonAnalyzer = usePythonAnalyzer(
    [implementation],
    0,
    [],
  );

  const postExecuteSingleCell = (
    idx: number,
    response: ExecutionResponse | undefined,
  ) => {
    if (idx === 0) {
      setUsageExecutedSuccessfully(!isExecutionError(response));
    }
  };

  useEffect(() => {
    setImplementation(externalImplementation);
  }, [externalImplementation]);

  const resetSelectedFunction = () => {
    setSelectedFunction('');
  };

  const resetDescription = () => {
    setDescription('');
  };

  useEffect(() => {
    const newFunctions: PythonFunction[] =
      analyze(implementation).defined_functions;
    // Reset the selected function if a function with such a name does not exist anymore
    if (
      selectedFunction &&
      !newFunctions.some((f) => f.name === selectedFunction)
    ) {
      resetSelectedFunction();
    }
    setFunctions(newFunctions);
  }, [implementation, selectedFunction]);

  const activityVariant = toolboxActivityVariant(selectedFunction);

  const initialCodeCells = initialStateSingleCell(usage);
  const [codeCells, setCodeCells] = useState<CodeCellState[]>(initialCodeCells);
  const activity = useTemporaryActivity(
    initialCodeCells,
    codeCells,
    setCodeCells,
    activityVariant,
    getExtraToolboxFunction,
    postExecuteSingleCell,
  );

  const initUsage = (newSelectedFn: string) => {
    // Do not overwrite the usage if the user has edited it at least once in the past
    if (newSelectedFn && newSelectedFn !== selectedFunction && !usageEdited) {
      const newUsage = joinLines([
        `from ${TOOLBOX_FILE} import ${newSelectedFn}`,
        'from pytamaro import _',
        '',
        '...',
      ]);
      activity.handleSourceChanged(newUsage, 0);
      setUsage(newUsage);
      setUsageExecutedSuccessfully(false);
    }
  };

  const initDocstring = (newSelectedFn: string) => {
    if (newSelectedFn && newSelectedFn !== selectedFunction) {
      const sourceDocstring = functions.find(
        (f) => f.name === newSelectedFn,
      )?.docstring;
      if (sourceDocstring) {
        setDescription(sourceDocstring);
      }
    }
  };

  const handleImplementationChange = (newImplementation: string) => {
    setImplementation(newImplementation);
    setUsageExecutedSuccessfully(false);
    setInvalidUsageExecution(true);
  };

  return (
    <Dialog onClose={() => onClose()} open={open} maxWidth='md' fullWidth>
      <DialogTitle>
        {replaceExistingFunction
          ? t('toolbox.dialogTitleEdit')
          : t('toolbox.dialogTitle')}
        <IconButton
          aria-label='close'
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
        <Typography color='text.secondary' fontWeight='bold' marginBottom={2}>
          {t('toolbox.implementation')}
        </Typography>
        {!replaceExistingFunction && (
          <Alert severity='info' sx={{ mb: 2 }}>
            {t('toolbox.cleanUp')}
            <ul
              style={{
                marginTop: theme.spacing(0.5),
                marginBottom: 0,
                paddingInlineStart: theme.spacing(2),
              }}
            >
              <li>{t('toolbox.removeSuperfluousCode')}</li>
              <li>
                <Trans
                  t={t}
                  i18nKey='toolbox.removeOutputs'
                  components={{
                    code: <code />,
                  }}
                />
              </li>
              <li>{t('toolbox.removeImports')}</li>
            </ul>
          </Alert>
        )}
        <CodeEditor
          initialSource={externalImplementation}
          currentSource={implementation}
          onChange={handleImplementationChange}
          pythonAnalyzer={implementationPythonAnalyzer}
        />
        <Box marginTop={4} />
        {functions.length > 0 ? (
          <>
            <Stack
              direction='row'
              spacing='2ch'
              alignItems='baseline'
              marginBottom={2}
            >
              <Typography
                color='text.secondary'
                minWidth='max-content'
                fontWeight='bold'
              >
                {replaceExistingFunction
                  ? t('toolbox.functionToEdit')
                  : t('toolbox.functionToSave')}
              </Typography>
              {replaceExistingFunction ? (
                <Typography
                  color='text.secondary'
                  fontWeight='bold'
                  fontFamily={theme.pytamaro.monospaceFontFamily}
                >
                  {initialName}
                </Typography>
              ) : (
                <SelectFunction
                  functions={functions}
                  selectedFunction={selectedFunction}
                  setSelectedFunction={(newSelectedFn) => {
                    initUsage(newSelectedFn);
                    initDocstring(newSelectedFn);
                    setSelectedFunction(newSelectedFn);
                  }}
                />
              )}
              <TextField
                variant='filled'
                size='small'
                helperText={t('toolbox.documentationHelp')}
                sx={{ '& .MuiInputBase-root': { pt: 0.5 } }}
                FormHelperTextProps={{ sx: { textAlign: 'center' } }}
                fullWidth
                multiline
                value={description}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDescription(event.target.value);
                }}
                className='function-description'
              />
            </Stack>
            {alreadyExists && !replaceExistingFunction && (
              <Alert severity='error'>
                <Trans
                  t={t}
                  i18nKey='toolbox.nameAlreadyExists'
                  components={{
                    link: (
                      <Link
                        href={toolboxFunctionPathname(selectedFunction)}
                        target='_blank'
                      />
                    ),
                  }}
                />
              </Alert>
            )}
            {replaceExistingFunction && !replacingFunctionFound && (
              <Alert severity='error'>{t('toolbox.nameDisappeared')}</Alert>
            )}
            {selectedFunction &&
              (!alreadyExists || replaceExistingFunction) &&
              (!description ? (
                <Alert severity='info'>{t('toolbox.addDescription')}</Alert>
              ) : (
                <div id='usage'>
                  <Typography
                    color='text.secondary'
                    marginTop={2}
                    marginBottom={2}
                    fontWeight='bold'
                  >
                    {t('toolbox.usageExample')}
                  </Typography>
                  <SolitaryCodeCell
                    activity={activity}
                    activityVariant={activityVariant}
                    requireNewExecution={invalidUsageExecution}
                    postSourceChange={() => {
                      setUsageEdited(true);
                      setUsageExecutedSuccessfully(false);
                    }}
                    onExecutionRequest={() => {
                      setInvalidUsageExecution(false);
                    }}
                    extraToolboxFunctions={
                      newToolboxFunction ? [newToolboxFunction] : []
                    }
                  />
                </div>
              ))}
            {selectedPythonFunction &&
              (!alreadyExists || replaceExistingFunction) &&
              description && (
                <>
                  {!usageExecutedSuccessfully && (
                    <Alert sx={{ mt: 2 }} severity='info'>
                      {t('toolbox.runUsageExample')}
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
                        resetSelectedFunction();
                        resetDescription();
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
          <Alert severity='error'>{t('toolbox.noFunctionDef')}</Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
