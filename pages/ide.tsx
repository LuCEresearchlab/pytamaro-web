import {
  Abc,
  ImageOutlined,
  Memory,
  PlayCircleFilled,
} from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { saveAs } from 'file-saver';
import { useConfirm } from 'material-ui-confirm';
import Head from 'next/head';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Group, Panel, Separator, usePanelRef } from 'react-resizable-panels';
import BinaryFileView from '../components/BinaryFileView';
import BytesFileView from '../components/BytesFileView';
import { NoOutputTip } from '../components/CodeCellTips';
import CodeEditor from '../components/CodeEditor';
import CustomSnackbar from '../components/CustomSnackbar';
import DataSharingPreferenceDialog from '../components/DataSharingPreferenceDialog';
import DocumentationStripe from '../components/documentation/DocumentationStripe';
import EditorTabs from '../components/EditorTabs';
import IdeFileManager from '../components/IdeFileManager';
import ExecutionOutputArea from '../components/input_output/ExecutionOutputArea';
import { OUTPUT_AREA_BACKGROUND_COLOR } from '../components/input_output/OutputArea';
import LibrariesButton from '../components/navbar/LibrariesButton';
import NavigationBar from '../components/navbar/NavigationBar';
import ResetButton from '../components/navbar/ResetButton';
import RunButton from '../components/RunButton';
import StaleOutputBadge from '../components/StaleOutputBadge';
import { toCustomDiagnostics } from '../src/editor/diagnostics';
import { filePreview, viewKind } from '../src/ideFileContent';
import { baseName, IdeFile, isPythonFileName } from '../src/ideFiles';
import { downloadFilesAsZip, readFilesFromZip } from '../src/ideFilesZip';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { playgroundActivityVariant } from '../src/playground';
import { PythonName } from '../src/python-analyzer/python_analyzer';
import { translationProps } from '../src/serverSideTranslationProps';
import theme from '../src/theme';
import useEditorAnalysisResult from '../src/useEditorAnalysisResult';
import useIdeExecution from '../src/useIdeExecution';
import useIdeSession from '../src/useIdeSession';
import { useIsHydrated } from '../src/useIsHydrated';

/** Opens the OS file picker and passes the chosen file, if any. */
function pickFile(accept: string, onFile: (file: File) => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file !== undefined) {
      onFile(file);
    }
  };
  input.click();
}

export default function Ide() {
  const { t } = useLocalTranslation(['common']);
  const { t: tIde } = useLocalTranslation(['ide']);
  const {
    workspace,
    loaded,
    fileNames,
    binaryFileNames,
    openFiles,
    activeFile,
    modified,
    addFile,
    addFolder,
    renameFolder,
    deleteFolder,
    folderNames,
    openFile,
    closeFile,
    deleteFile,
    renameFile,
    resetWorkspace,
    syncWorkspaceChanges,
  } = useIdeSession();
  const execution = useIdeExecution(
    workspace,
    activeFile,
    syncWorkspaceChanges,
  );
  const analysisResult = useEditorAnalysisResult(
    workspace.editorSession,
    activeFile,
  );
  const isHydrated = useIsHydrated();
  const confirm = useConfirm();
  const { run: runExecution, liveAnalysis } = execution;

  const getActiveKind = () => {
    if (activeFile === '') {
      return '';
    }
    const bytes = workspace.bytes(activeFile);
    return bytes === undefined ? '' : viewKind(activeFile, bytes);
  };
  const activeKind = useSyncExternalStore(
    workspace.subscribe,
    getActiveKind,
    getActiveKind,
  );
  const isText = activeKind === 'text';
  const activeFileBytes =
    activeFile === '' ? undefined : workspace.bytes(activeFile);
  const activePreview =
    activeFileBytes === undefined
      ? undefined
      : filePreview(activeFile, activeFileBytes);
  const isPreview = activePreview !== undefined;
  const [viewMode, setViewMode] = useState<'text' | 'preview' | 'bytes' | null>(
    null,
  );
  // The view is a per-file mode: switching file always shows the default view.
  const view = viewMode ?? (isPreview ? 'preview' : 'text');
  useEffect(() => {
    setViewMode(null);
  }, [activeFile, isText, isPreview]);
  const showBinaryView = !isText || (isPreview && view === 'preview');
  const isPythonFile =
    activeFile !== '' &&
    isPythonFileName(activeFile) &&
    workspace.text(activeFile) !== undefined;
  const outputShown =
    execution.outputAreaVisible ||
    execution.executionResponse?.type === 'failure';
  const outputGroupRef = useRef<HTMLDivElement>(null);
  const outputContentRef = useRef<HTMLDivElement>(null);
  const outputPanelRef = usePanelRef();
  // The output never leaves empty space below its content: the panel grows to
  // the content's height, up to a fraction of the available space. It never
  // shrinks automatically, so updating output does not make the panel jump.
  const [outputHeight, setOutputHeight] = useState(0);

  useLayoutEffect(() => {
    const content = outputContentRef.current;
    if (!outputShown || content === null) {
      return;
    }
    const measure = () => {
      const contentHeight = content.offsetHeight;
      const groupHeight = outputGroupRef.current?.offsetHeight ?? contentHeight;
      setOutputHeight((currentHeight) =>
        Math.min(groupHeight * 0.8, Math.max(currentHeight, contentHeight)),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [isPythonFile, outputShown]);

  // Resizing in a frame, rather than during the layout effect, gives the group
  // time to register the panel (which is mounted conditionally).
  useEffect(() => {
    if (!isPythonFile || !outputShown || outputHeight === 0) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      outputPanelRef.current?.resize(outputHeight);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPythonFile, outputHeight, outputPanelRef, outputShown]);

  const handleExecutionRequest = useCallback(async () => {
    const diagnostics = toCustomDiagnostics(
      workspace.editorSession.diagnosticsForFile(activeFile),
      liveAnalysis,
    );
    if (diagnostics.length === 0) {
      return runExecution();
    }
    const { confirmed } = await confirm({
      title: t('confirmExecutionWithErrors.title'),
      description: t('confirmExecutionWithErrors.descriptionOnlyCurrentFile', {
        count: diagnostics.length,
      }),
      confirmationText: t('confirmExecutionWithErrors.confirmationText'),
      cancellationText: t('confirmExecutionWithErrors.cancellationText'),
      confirmationButtonProps: {
        endIcon: <PlayCircleFilled />,
        variant: 'contained',
      },
    });
    if (confirmed) {
      return runExecution();
    }
  }, [
    activeFile,
    confirm,
    liveAnalysis,
    runExecution,
    t,
    workspace.editorSession,
  ]);

  const [hoveredName, setHoveredName] = useState<PythonName | null>(null);
  const [fileTransferError, setFileTransferError] = useState<
    'download' | 'import' | null
  >(null);

  const editorContext = useMemo(
    () =>
      activeFile !== '' && isText
        ? workspace.editorContext(activeFile)
        : undefined,
    [workspace, activeFile, isText],
  );

  const downloadFile = (name: string) => {
    const content = workspace.bytes(name);
    if (content === undefined) {
      return;
    }
    saveAs(
      new Blob([new Uint8Array(content)], {
        type:
          filePreview(name, content)?.mimeType ??
          (viewKind(name, content) === 'text'
            ? 'text/plain;charset=utf-8'
            : 'application/octet-stream'),
      }),
      baseName(name),
    );
  };

  const importFiles = (files: readonly IdeFile[], open: boolean) => {
    const conflictingNames = files
      .map(({ path }) => path.trim())
      .filter((path) => fileNames.includes(path));
    const conflicts = new Set(conflictingNames);

    const importAll = (overwriteConflicts: boolean) => {
      files.forEach(({ path, content }) =>
        addFile(path, content, {
          overwrite: overwriteConflicts && conflicts.has(path.trim()),
          open,
        }),
      );
    };

    if (conflictingNames.length === 0) {
      importAll(false);
      return;
    }

    confirm({
      title: tIde('overwriteFilesAreYouSure'),
      description: tIde('overwriteFilesWarning', {
        names: conflictingNames.join(', '),
      }),
      confirmationText: tIde('overwriteFiles'),
      cancellationText: t('confirmCancel'),
    }).then(({ confirmed }) => {
      if (confirmed) {
        importAll(true);
      }
    });
  };

  const handleUploadFiles = (files: File[], folder: string) => {
    void Promise.all(
      files.map(async (file) => {
        const bytes = new Uint8Array(await file.arrayBuffer());
        return {
          path: folder.length === 0 ? file.name : `${folder}/${file.name}`,
          content: bytes,
        };
      }),
    ).then((ideFiles) => importFiles(ideFiles, ideFiles.length === 1));
  };

  const handleDownloadZip = () => {
    const files = fileNames.map((path) => ({
      path,
      content: workspace.bytes(path) ?? new Uint8Array(0),
    }));
    downloadFilesAsZip(files).catch(() => {
      setFileTransferError('download');
    });
  };

  const handleUploadZip = () =>
    pickFile('.zip,application/zip', (file) => {
      readFilesFromZip(file)
        .then((files) => {
          importFiles(files, false);
        })
        .catch(() => {
          setFileTransferError('import');
        });
    });

  const handleReset = () => {
    confirm({
      title: t('resetAreYouSure'),
      description: tIde('resetIdeWarning'),
      confirmationText: tIde('resetIdeConfirm'),
      cancellationText: t('confirmCancel'),
    }).then(({ confirmed }) => {
      if (confirmed) {
        resetWorkspace();
        execution.resetExecution();
      }
    });
  };

  const viewToggle =
    activeFile === ''
      ? undefined
      : {
          value: view,
          onChange: (nextView: string) =>
            setViewMode(nextView as 'text' | 'preview' | 'bytes'),
          options: [
            {
              value: 'text',
              label: tIde('viewAsText'),
              icon: <Abc fontSize='small' />,
            },
            ...(isPreview
              ? [
                  {
                    value: 'preview',
                    label: tIde('binaryFilePreview'),
                    icon: <ImageOutlined fontSize='small' />,
                  },
                ]
              : []),
            {
              value: 'bytes',
              label: tIde('viewAsBytes'),
              icon: <Memory fontSize='small' />,
            },
          ],
        };

  return (
    <>
      <Head>
        <title>IDE - PyTamaro</title>
      </Head>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <NavigationBar>
          <LibrariesButton />
          <ResetButton
            enabled={modified}
            onReset={handleReset}
            tooltip={tIde('resetIde')}
          />
        </NavigationBar>
        <DataSharingPreferenceDialog />
        <CustomSnackbar
          visible={fileTransferError !== null}
          setVisible={() => setFileTransferError(null)}
          severity='error'
          message={tIde(
            fileTransferError === 'download'
              ? 'zipDownloadFailed'
              : 'zipImportFailed',
          )}
        />
        <Group orientation='horizontal' style={{ flex: 1, minHeight: 0 }}>
          <Panel defaultSize='18%' minSize='8%' collapsible>
            <IdeFileManager
              fileNames={fileNames}
              folderNames={folderNames}
              binaryFileNames={binaryFileNames}
              activeFile={activeFile}
              onOpenFile={openFile}
              onDownloadFile={downloadFile}
              onAddFile={addFile}
              onAddFolder={addFolder}
              onRenameFolder={renameFolder}
              onRenameFile={renameFile}
              onDeleteFile={deleteFile}
              onDeleteFolder={deleteFolder}
              onUploadFiles={handleUploadFiles}
              loaded={loaded && isHydrated}
              onDownloadZip={handleDownloadZip}
              onUploadZip={handleUploadZip}
            />
          </Panel>
          <Separator
            style={{
              width: theme.spacing(0.25),
              backgroundColor: theme.palette.divider,
              cursor: 'col-resize',
            }}
          />
          <Panel>
            <Stack direction='column' sx={{ height: '100%', minHeight: 0 }}>
              {openFiles.length > 0 && (
                <EditorTabs
                  fileNames={openFiles}
                  activeFile={activeFile}
                  onSelect={openFile}
                  onClose={closeFile}
                  viewToggle={viewToggle}
                />
              )}
              {view !== 'bytes' && (
                <DocumentationStripe
                  analysisResult={analysisResult}
                  activityVariant={playgroundActivityVariant}
                  hoveredName={hoveredName}
                />
              )}
              <Group
                orientation='vertical'
                elementRef={outputGroupRef}
                style={{ flex: 1, minHeight: 0 }}
              >
                <Panel>
                  <Stack
                    direction='column'
                    sx={{ height: '100%', minHeight: 0 }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        position: 'relative',
                        overflow: 'hidden',
                        paddingTop: 1,
                        paddingLeft: 1,
                        backgroundColor: 'white',
                      }}
                    >
                      {loaded &&
                        activeFile !== '' &&
                        editorContext !== undefined &&
                        view === 'text' && (
                          <CodeEditor
                            modelPath={activeFile}
                            context={editorContext}
                            autoHeight={false}
                            readOnly={
                              execution.executing &&
                              execution.readOnlyFiles.has(activeFile)
                            }
                            onChange={execution.markOutputStale}
                            onExecutionRequested={handleExecutionRequest}
                            executionAllowed={execution.runEnabled}
                            executionResponse={execution.executionResponse}
                            showRuntimeAnnotations={
                              execution.executionFinished &&
                              execution.outputSynced
                            }
                            onRuntimeErrorDismissed={execution.markOutputStale}
                            setHoveredName={setHoveredName}
                          />
                        )}
                      {loaded &&
                        activeFile !== '' &&
                        isText &&
                        view === 'bytes' &&
                        activeFileBytes !== undefined && (
                          <BytesFileView bytes={activeFileBytes} />
                        )}
                      {loaded && activeFile !== '' && showBinaryView && (
                        <BinaryFileView
                          name={activeFile}
                          content={activeFileBytes}
                          preview={activePreview}
                          view={view}
                        />
                      )}
                      {loaded && activeFile === '' && (
                        <Stack
                          sx={{
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            padding: 3,
                            textAlign: 'center',
                            color: 'text.secondary',
                          }}
                        >
                          <Typography variant='h6'>
                            {tIde('noFileOpen')}
                          </Typography>
                          <Typography variant='body2'>
                            {tIde('noFileOpenHint')}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                    {isPythonFile && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          paddingX: 2,
                          paddingY: 1,
                          backgroundColor: theme.palette.background.paper,
                        }}
                      >
                        <RunButton
                          enabled={execution.runEnabled}
                          onExecutionRequested={handleExecutionRequest}
                          executing={execution.executing}
                          isExecutingPreviousCell={false}
                          executionFinished={execution.executionFinished}
                          executionError={execution.executionError}
                          isWaitingForInput={execution.isWaitingForInput}
                          runCodeLabelKey='runCode'
                        />
                      </Box>
                    )}
                  </Stack>
                </Panel>
                {isPythonFile && outputShown && (
                  <>
                    <Separator
                      aria-label={tIde('resizeOutput')}
                      style={{
                        height: theme.spacing(0.25),
                        backgroundColor: theme.palette.divider,
                        cursor: 'row-resize',
                      }}
                    />
                    <Panel
                      panelRef={outputPanelRef}
                      defaultSize={outputHeight > 0 ? outputHeight : '30%'}
                      minSize={20}
                      maxSize='80%'
                    >
                      <Box
                        sx={{
                          height: '100%',
                          overflow: 'auto',
                          backgroundColor: OUTPUT_AREA_BACKGROUND_COLOR,
                        }}
                      >
                        <Box ref={outputContentRef}>
                          {execution.finishedWithoutOutput && (
                            <StaleOutputBadge hidden={execution.outputSynced}>
                              <NoOutputTip
                                dimmed={!execution.outputSynced}
                                importedNames={analysisResult?.imported_names}
                              />
                            </StaleOutputBadge>
                          )}
                          {execution.executionResponse !== undefined && (
                            <ExecutionOutputArea
                              executionResponse={execution.executionResponse}
                              dimmed={!execution.outputSynced}
                              setOutputAreaRef={execution.setOutputAreaRef}
                              setIsWaitingForInput={
                                execution.setIsWaitingForInput
                              }
                            />
                          )}
                        </Box>
                      </Box>
                    </Panel>
                  </>
                )}
              </Group>
            </Stack>
          </Panel>
        </Group>
      </Box>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...(await translationProps(['ide'])),
    },
  };
}
