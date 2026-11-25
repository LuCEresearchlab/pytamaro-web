import {
  ExpandCircleDownOutlined,
  Notes,
  PlayCircleFilled,
  Preview,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material';
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
import { NoOutputTip } from '../components/CodeCellTips';
import CodeEditor from '../components/CodeEditor';
import CustomSnackbar from '../components/CustomSnackbar';
import DataSharingPreferenceDialog from '../components/DataSharingPreferenceDialog';
import DocumentationStripe from '../components/documentation/DocumentationStripe';
import EditorTabs from '../components/EditorTabs';
import BinInspectIconSvg from '../components/icons/BinInspectIconSvg';
import IdeFileManager from '../components/IdeFileManager';
import ExecutionOutputArea from '../components/input_output/ExecutionOutputArea';
import { OUTPUT_AREA_BACKGROUND_COLOR } from '../components/input_output/OutputArea';
import LibrariesButton from '../components/navbar/LibrariesButton';
import NavigationBar from '../components/navbar/NavigationBar';
import ResetButton from '../components/navbar/ResetButton';
import NonEditableFileView, {
  type FileViewMode,
} from '../components/NonEditableFileView';
import RunButton from '../components/RunButton';
import StaleOutputBadge from '../components/StaleOutputBadge';
import { toCustomDiagnostics } from '../src/editor/diagnostics';
import type { EditorSession } from '../src/editorSession';
import { filePreview, viewKind } from '../src/ide/fileContent';
import { baseName, IdeFile, isPythonFileName } from '../src/ide/files';
import useIdeExecution from '../src/ide/useIdeExecution';
import useIdeSession from '../src/ide/useIdeSession';
import { downloadFilesAsZip, readFilesFromZip } from '../src/ide/zip';
import { hasCmdModifier } from '../src/keyboardUtils';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import { playgroundActivityVariant } from '../src/playground';
import { PythonName } from '../src/python-analyzer/python_analyzer';
import { translationProps } from '../src/serverSideTranslationProps';
import { EventName, storeDbEvent } from '../src/storeDbEvent';
import theme from '../src/theme';
import useEditorAnalysisResult from '../src/useEditorAnalysisResult';
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

/**
 * True for Cmd+$expectedCode (macOS / iOS) or Ctrl+$expectedCode (other
 * platforms), on any keyboard layout.
 */
function isKeyboardShortcut(expectedCode: string, event: KeyboardEvent) {
  const modifierPressed = hasCmdModifier()
    ? event.metaKey && !event.ctrlKey
    : event.ctrlKey && !event.metaKey;
  return (
    modifierPressed &&
    !event.shiftKey &&
    !event.altKey &&
    event.code === expectedCode
  );
}

function IdeDocumentationStripe({
  editorSession,
  fileName,
  hoveredName,
}: {
  editorSession: EditorSession;
  fileName: string;
  hoveredName: PythonName | null;
}) {
  const analysisResult = useEditorAnalysisResult(editorSession, fileName);
  return (
    <DocumentationStripe
      analysisResult={analysisResult}
      activityVariant={playgroundActivityVariant}
      hoveredName={hoveredName}
    />
  );
}

function IdeNoOutputTip({
  editorSession,
  fileName,
  dimmed,
}: {
  editorSession: EditorSession;
  fileName: string;
  dimmed: boolean;
}) {
  const analysisResult = useEditorAnalysisResult(editorSession, fileName);
  return (
    <NoOutputTip
      dimmed={dimmed}
      importedNames={analysisResult?.imported_names}
    />
  );
}

export default function Ide() {
  const { t } = useLocalTranslation(['common']);
  const { t: tIde } = useLocalTranslation(['ide']);
  const { metadata } = useLocalProfile();
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
  const isHydrated = useIsHydrated();
  const confirm = useConfirm();
  const {
    run: runExecution,
    registerExecutionRequest,
    liveAnalysis,
  } = execution;

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
  const [viewMode, setViewMode] = useState<FileViewMode | null>(null);
  // The view is a per-file mode: switching file always shows the default view.
  const view: FileViewMode = viewMode ?? (isPreview ? 'preview' : 'text');
  useEffect(() => {
    setViewMode(null);
  }, [activeFile, isText, isPreview]);
  const isPythonFile =
    activeFile !== '' &&
    isPythonFileName(activeFile) &&
    workspace.text(activeFile) !== undefined;
  const outputAvailable =
    execution.outputAreaVisible || execution.executionResponse !== undefined;
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const showOutput = isPythonFile && outputAvailable && !outputCollapsed;

  const outputPanelRef = usePanelRef();
  const outputGroupRef = useRef<HTMLDivElement>(null);
  const outputContentRef = useRef<HTMLDivElement>(null);

  // Height (px) that fits the output content. It only grows, so updating the
  // output never makes the panel jump around.
  const [fitHeight, setFitHeight] = useState(0);
  // Height (px) the user chose by dragging. Once set, it wins over fitHeight
  // and is restored when the output is expanded again.
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const userResizingRef = useRef(false);
  const draggedHeightRef = useRef<number | null>(null);

  // Measure the content and remember the height that fits it.
  useLayoutEffect(() => {
    const content = outputContentRef.current;
    if (!showOutput || content === null) {
      return;
    }
    const measure = () => {
      const contentHeight = content.offsetHeight;
      const groupHeight = outputGroupRef.current?.offsetHeight ?? contentHeight;
      setFitHeight((current) =>
        Math.min(groupHeight * 0.9, Math.max(current, contentHeight)),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [showOutput]);

  // The panel stays mounted (so the output area keeps its state, e.g. a
  // partially typed input) and is collapsed/expanded through the panel API.
  // expand() restores the previous size; otherwise apply the fitted height,
  // unless the user has chosen their own. Doing it in a frame gives the group
  // time to register the conditionally mounted panel.
  useEffect(() => {
    if (!outputAvailable) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      const panel = outputPanelRef.current;
      if (panel === null) {
        return;
      }
      if (!showOutput) {
        if (!panel.isCollapsed()) {
          panel.collapse();
        }
        return;
      }
      if (panel.isCollapsed()) {
        panel.expand();
      }
      if (userHeight === null && fitHeight > 0 && !userResizingRef.current) {
        panel.resize(fitHeight);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [outputAvailable, showOutput, userHeight, fitHeight, outputPanelRef]);

  // A size change only counts as the user's preference if it happens during a
  // drag/keyboard gesture on the separator (not on mount or programmatic resize).
  const startUserResize = () => {
    userResizingRef.current = true;
  };
  const handleOutputResize = (size: { inPixels: number }) => {
    if (!userResizingRef.current) {
      return;
    }
    if (size.inPixels === 0) {
      // The user dragged the separator far enough to collapse the panel:
      // keep the toggle button in sync, and don't remember a height of 0.
      draggedHeightRef.current = null;
      setOutputCollapsed(true);
    } else {
      draggedHeightRef.current = size.inPixels;
    }
  };
  const endUserResize = useCallback(() => {
    if (!userResizingRef.current) {
      return;
    }
    userResizingRef.current = false;
    if (draggedHeightRef.current !== null) {
      setUserHeight(draggedHeightRef.current);
      draggedHeightRef.current = null;
    }
  }, []);

  // Capture phase, so the gesture ends even if something stops propagation.
  useEffect(() => {
    window.addEventListener('pointerup', endUserResize, true);
    window.addEventListener('pointercancel', endUserResize, true);
    return () => {
      window.removeEventListener('pointerup', endUserResize, true);
      window.removeEventListener('pointercancel', endUserResize, true);
    };
  }, [endUserResize]);

  // A new input request always reveals the output area, even if it was hidden.
  useEffect(() => {
    if (execution.isWaitingForInput) {
      setOutputCollapsed(false);
    }
  }, [execution.isWaitingForInput]);

  // Cmd/Ctrl+J toggles the output area. Capture phase, so it also works while
  // the code editor has focus.
  useEffect(() => {
    if (!isPythonFile || !outputAvailable) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || !isKeyboardShortcut('KeyJ', event)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setOutputCollapsed((collapsed) => !collapsed);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isPythonFile, outputAvailable]);

  // Cmd/Ctrl+B toggles the file manager area.
  const sidebarPanelRef = usePanelRef();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const ref = sidebarPanelRef.current;
      if (event.repeat || !isKeyboardShortcut('KeyB', event) || ref === null) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      if (ref.isCollapsed()) {
        ref.expand();
      } else {
        ref.collapse();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarPanelRef]);

  const shortcutLabel = isHydrated && hasCmdModifier() ? '⌘J' : 'Ctrl+J';

  const handleExecutionRequest = useCallback(async () => {
    const executionUUID = crypto.randomUUID();
    registerExecutionRequest(executionUUID);
    const diagnostics = toCustomDiagnostics(
      workspace.editorSession.diagnosticsForFile(activeFile),
      liveAnalysis,
    );
    if (diagnostics.length > 0) {
      const { confirmed } = await confirm({
        title: t('confirmExecutionWithErrors.title'),
        description: t(
          'confirmExecutionWithErrors.descriptionOnlyCurrentFile',
          {
            count: diagnostics.length,
          },
        ),
        confirmationText: t('confirmExecutionWithErrors.confirmationText'),
        cancellationText: t('confirmExecutionWithErrors.cancellationText'),
        confirmationButtonProps: {
          endIcon: <PlayCircleFilled />,
          variant: 'contained',
        },
      });
      storeDbEvent(EventName.CodeExecutionErrorsWarning, metadata, {
        executionUUID,
        forced_execution: confirmed,
      });
      if (!confirmed) return;
    }
    // Running always reveals the output area, even if it was collapsed before.
    setOutputCollapsed(false);
    return runExecution(executionUUID);
  }, [
    activeFile,
    confirm,
    liveAnalysis,
    registerExecutionRequest,
    metadata,
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

  const hasActiveFile = loaded && activeFile !== '';
  const isEditing = isText && view === 'text';
  const showEditor = hasActiveFile && isEditing && editorContext !== undefined;
  const showNonEditable = hasActiveFile && !isEditing;
  const showNoFileOpen = loaded && activeFile === '';

  const showRuntimeAnnotations =
    execution.executionFinished && execution.outputSynced;

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
        setUserHeight(null);
        setFitHeight(0);
      }
    });
  };

  const viewToggle =
    activeFile === ''
      ? undefined
      : {
          value: view,
          onChange: (nextView: string) => setViewMode(nextView as FileViewMode),
          options: [
            {
              value: 'text',
              label: tIde('viewAsText'),
              icon: <Notes fontSize='small' />,
            },
            ...(isPreview
              ? [
                  {
                    value: 'preview',
                    label: tIde('viewAsPreview'),
                    icon: <Preview fontSize='small' />,
                  },
                ]
              : []),
            {
              value: 'bytes',
              label: tIde('viewAsBytes'),
              icon: (
                <SvgIcon fontSize='small'>
                  <BinInspectIconSvg />
                </SvgIcon>
              ),
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
          <Panel
            panelRef={sidebarPanelRef}
            defaultSize='18%'
            minSize='8%'
            collapsible
            collapsedSize={0}
          >
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
                  runningFile={execution.runningFile}
                />
              )}
              {view !== 'bytes' && (
                <IdeDocumentationStripe
                  editorSession={workspace.editorSession}
                  fileName={activeFile}
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
                      {showEditor && (
                        <CodeEditor
                          modelPath={activeFile}
                          context={editorContext}
                          autoHeight={false}
                          readOnly={execution.executing}
                          onChange={execution.markOutputStale}
                          onExecutionRequested={handleExecutionRequest}
                          executionAllowed={execution.runEnabled}
                          executionResponse={execution.executionResponse}
                          showRuntimeAnnotations={showRuntimeAnnotations}
                          onRuntimeErrorDismissed={execution.markOutputStale}
                          setHoveredName={setHoveredName}
                        />
                      )}
                      {showNonEditable && (
                        <NonEditableFileView
                          name={activeFile}
                          content={activeFileBytes}
                          preview={activePreview}
                          view={view}
                        />
                      )}
                      {showNoFileOpen && (
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
                          justifyContent: 'space-between',
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
                        {outputAvailable && (
                          <Tooltip
                            placement='left'
                            arrow
                            title={`${t(
                              outputCollapsed ? 'showOutput' : 'hideOutput',
                            )} (${shortcutLabel})`}
                          >
                            <IconButton
                              aria-expanded={!outputCollapsed}
                              aria-keyshortcuts='Control+J Meta+J'
                              aria-label={t(
                                outputCollapsed ? 'showOutput' : 'hideOutput',
                              )}
                              data-testid='toggle-output-area'
                              onClick={() =>
                                setOutputCollapsed((collapsed) => !collapsed)
                              }
                              size='small'
                            >
                              <ExpandCircleDownOutlined
                                sx={{
                                  transform: `rotate(${outputCollapsed ? '180' : '0'}deg)`,
                                  transition: (theme) =>
                                    theme.transitions.create('transform', {
                                      duration:
                                        theme.transitions.duration.standard,
                                    }),
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </Stack>
                </Panel>
                {/* Separator and Panel must be direct DOM children of Group. */}
                {outputAvailable && (
                  <>
                    <Separator
                      id='output-separator'
                      aria-label={tIde('resizeOutput')}
                      disabled={!showOutput}
                      onPointerDown={startUserResize}
                      onKeyDown={startUserResize}
                      onKeyUp={endUserResize}
                      onBlur={endUserResize}
                      style={{
                        height: '10px',
                        margin: '-4px 0',
                        position: 'relative',
                        zIndex: 10,
                        cursor: 'row-resize',
                        touchAction: 'none',
                        display: showOutput ? 'flex' : 'none',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '2px',
                          backgroundColor: theme.palette.divider,
                          pointerEvents: 'none',
                        }}
                      />
                    </Separator>
                    <Panel
                      panelRef={outputPanelRef}
                      collapsible
                      collapsedSize={0}
                      defaultSize={
                        userHeight ?? (fitHeight > 0 ? fitHeight : '30%')
                      }
                      minSize='2rem'
                      maxSize='90%'
                      onResize={handleOutputResize}
                      // The stale-output badge overhangs the top edge of the
                      // output area; let it escape the panel instead of being
                      // clipped. The output area itself scrolls through its own
                      // container below.
                      style={{ overflow: 'visible' }}
                    >
                      <StaleOutputBadge
                        hidden={execution.outputSynced}
                        overhang='vertical'
                        sx={{
                          height: '100%',
                          display: 'flex',
                          // Keeps the content mounted but hidden and unfocusable
                          // while the panel is collapsed.
                          visibility: showOutput ? 'visible' : 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            minHeight: 0,
                            overflow: 'auto',
                            backgroundColor: OUTPUT_AREA_BACKGROUND_COLOR,
                          }}
                        >
                          <Box ref={outputContentRef}>
                            {execution.finishedWithoutOutput && (
                              <IdeNoOutputTip
                                editorSession={workspace.editorSession}
                                fileName={activeFile}
                                dimmed={!execution.outputSynced}
                              />
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
                      </StaleOutputBadge>
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
