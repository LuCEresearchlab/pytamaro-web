import {
  Archive,
  CreateNewFolderOutlined,
  Folder,
  NoteAddOutlined,
  Unarchive,
  UploadFileOutlined,
} from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useConfirm } from 'material-ui-confirm';
import {
  ChangeEvent,
  DragEvent,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ExecutorContext } from '../../../src/execution/executorContext';
import useLocalTranslation from '../../../src/localStorage/useLocalTranslation';
import SidebarTitle from '../../sidebar/SidebarTitle';
import { fileIcon, InlineNameInput } from './InlineNameInput';
import TreeNodeRow, { RowLabel } from './treeNodeRow';
import {
  buildFileForest,
  dropFolderOf,
  FOLDER_PREFIX,
  folderItemIds,
  isFileDrag,
  joinPath,
  parentPath,
  TreeEdit,
} from './utils';

export type IdeFileManagerProps = {
  fileNames: readonly string[];
  folderNames: readonly string[];
  binaryFileNames: readonly string[];
  activeFile: string;
  onOpenFile: (path: string) => void;
  onDownloadFile: (path: string) => void;
  onAddFile: (path: string) => boolean;
  onAddFolder: (path: string) => boolean;
  onRenameFile: (oldPath: string, newPath: string) => boolean;
  onRenameFolder: (oldPath: string, newPath: string) => boolean;
  onDeleteFile: (path: string) => void;
  onDeleteFolder: (path: string) => void;
  /**
   * Called when files from the user's device are dropped onto the tree.
   * `folder` is the path of the folder they were dropped on ('' for the root).
   */
  onUploadFiles: (files: File[], folder: string) => void;
  /** Whether the workspace files have loaded; the tree is hidden until then. */
  loaded: boolean;
  /** Downloads all workspace files as a zip archive. */
  onDownloadZip: () => void;
  /** Imports files from a zip archive chosen by the user. */
  onUploadZip: () => void;
};

/**
 * The file manager sidebar of the IDE. Files and folders can be created at the
 * root through the header buttons or inside any folder (through its hover
 * actions). Files from the user's device can be dragged onto the tree: dropping
 * on a folder (or on a file inside it) uploads into that folder, dropping
 * anywhere else uploads into the root. The header also downloads the workspace
 * as a zip archive and imports one.
 */
export default function IdeFileManager({
  fileNames,
  folderNames,
  binaryFileNames,
  activeFile,
  onOpenFile,
  onDownloadFile,
  onAddFile,
  onAddFolder,
  onRenameFile,
  onRenameFolder,
  onDeleteFile,
  onDeleteFolder,
  onUploadFiles,
  loaded,
  onDownloadZip,
  onUploadZip,
}: IdeFileManagerProps) {
  const { t } = useLocalTranslation(['ide', 'common']);
  const confirm = useConfirm();
  const [edit, setEdit] = useState<TreeEdit>(null);
  /** The name currently typed into the inline input, for the row's icon. */
  const [draftName, setDraftName] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  /** The folder that files are being dragged over; null if there is no drag. */
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  /** The file picker input, shared by all upload buttons. */
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** The folder into which the files chosen through the picker are uploaded. */
  const uploadFolderRef = useRef('');

  // Do not allow to edit the project workspace while we're running code.
  const { executorState } = useContext(ExecutorContext);
  const [workspaceActionsDisabled, setWorkspaceActionsDisabled] =
    useState(true);
  useEffect(
    () => setWorkspaceActionsDisabled(executorState.type === 'executing'),
    [executorState],
  );

  const forest = useMemo(
    () => buildFileForest(fileNames, folderNames),
    [fileNames, folderNames],
  );
  const folderIds = useMemo(() => folderItemIds(forest), [forest]);
  const binaryFiles = useMemo(
    () => new Set(binaryFileNames),
    [binaryFileNames],
  );

  // A folder is expanded when it first appears (e.g., as soon as the first
  // file inside it exists). Later changes to the tree must not touch folders
  // that were already known, so that explicitly collapsed ones stay collapsed.
  const knownFoldersRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const known = knownFoldersRef.current;
    const appeared = folderIds.filter((itemId) => !known.has(itemId));
    knownFoldersRef.current = new Set(folderIds);
    if (appeared.length > 0) {
      setExpandedItems((previous) => [
        ...previous,
        ...appeared.filter((itemId) => !previous.includes(itemId)),
      ]);
    }
  }, [folderIds]);

  const startCreate = (kind: 'file' | 'folder', parent: string) => {
    if (parent.length > 0) {
      const itemId = `${FOLDER_PREFIX}${parent}`;
      setExpandedItems((previous) =>
        previous.includes(itemId) ? previous : [...previous, itemId],
      );
    }
    setDraftName('');
    setEdit({ mode: 'create', kind, parent });
  };

  const askDelete = (path: string, isFolder: boolean) => {
    const prefix = isFolder ? 'deleteFolder' : 'deleteFile';
    confirm({
      title: t(`${prefix}AreYouSure`),
      description: t(`${prefix}Warning`, { name: path }),
      confirmationText: t(prefix),
      cancellationText: t('common:confirmCancel'),
    }).then(({ confirmed }) => {
      if (confirmed) {
        (isFolder ? onDeleteFolder : onDeleteFile)(path);
      }
    });
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!isFileDrag(event)) {
      return;
    }
    // Allows dropping here; also fires repeatedly, which keeps the highlight
    // correct while the pointer moves between rows.
    event.preventDefault();
    const transfer = event.dataTransfer;
    transfer.dropEffect = 'copy';
    setDropTarget(dropFolderOf(event.target));
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    // Moving between child elements also fires dragleave; only react when the
    // pointer actually leaves the drop zone.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDropTarget(null);
    }
  };

  /** Uploads the files into `folder`, ignoring empty selections. */
  const uploadFiles = (files: File[], folder: string) => {
    if (files.length > 0) {
      onUploadFiles(files, folder);
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (!isFileDrag(event)) {
      return;
    }
    event.preventDefault();
    const folder = dropFolderOf(event.target);
    setDropTarget(null);
    // Read the items synchronously; the DataTransfer is emptied after the
    // event. Dropped directories are skipped, only plain files are uploaded.
    const files = Array.from(event.dataTransfer.items)
      .filter(
        (item) =>
          item.kind === 'file' && item.webkitGetAsEntry()?.isDirectory !== true,
      )
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    uploadFiles(files, folder);
  };

  const pickFiles = (folder: string) => {
    uploadFolderRef.current = folder;
    fileInputRef.current?.click();
  };

  const handleFilesChosen = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    // Reset so that choosing the same file again still triggers a change.
    input.value = '';
    uploadFiles(files, uploadFolderRef.current);
  };

  const renderCreateRow = (kind: 'file' | 'folder', parent: string) => (
    <TreeItem
      key={`__new-${kind}__`}
      itemId={`__new-${kind}__:${parent}`}
      slots={{ icon: kind === 'file' ? fileIcon(draftName, false) : Folder }}
      label={
        <RowLabel actionCount={0}>
          <InlineNameInput
            placeholder={t(kind === 'file' ? 'fileName' : 'folderName')}
            onNameChange={setDraftName}
            onSubmit={(name) => {
              const created = (kind === 'file' ? onAddFile : onAddFolder)(
                joinPath(parent, name),
              );
              if (created) {
                setEdit(null);
              }
              return created;
            }}
            onCancel={() => setEdit(null)}
          />
        </RowLabel>
      }
    />
  );

  /** The creation row, if the user is currently creating inside `parent`. */
  const createRowFor = (parent: string): ReactNode =>
    edit?.mode === 'create' && edit.parent === parent
      ? renderCreateRow(edit.kind, parent)
      : null;

  const onStartRename = (path: string) => {
    setDraftName(path);
    setEdit({ mode: 'rename', path });
  };

  const [selectedFolder, setSelectedFolder] = useState('');
  useEffect(() => {
    if (activeFile.startsWith(FOLDER_PREFIX)) {
      setSelectedFolder(activeFile);
    } else {
      setSelectedFolder(parentPath(activeFile));
    }
  }, [activeFile]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        paddingX: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 0.5,
          paddingX: 1,
          paddingTop: 1,
        }}
      >
        <SidebarTitle sx={{ paddingBottom: 0 }}>
          {t('fileManager')}
        </SidebarTitle>
        <Stack direction='row' sx={{ flexWrap: 'wrap' }}>
          <Tooltip arrow title={t('addEmptyFile')}>
            <IconButton
              size='small'
              aria-label={t('addEmptyFile')}
              disabled={workspaceActionsDisabled}
              onClick={() => startCreate('file', selectedFolder)}
              data-testid='new-file-button'
            >
              <NoteAddOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t('addFileFromDevice')}>
            <IconButton
              size='small'
              aria-label={t('addFileFromDevice')}
              disabled={workspaceActionsDisabled}
              onClick={() => pickFiles(selectedFolder)}
              data-testid='upload-file-button'
            >
              <UploadFileOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t('addFolder')}>
            <IconButton
              size='small'
              aria-label={t('addFolder')}
              disabled={workspaceActionsDisabled}
              onClick={() => startCreate('folder', selectedFolder)}
              data-testid='new-folder-button'
            >
              <CreateNewFolderOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t('downloadFilesAsZip')}>
            <IconButton
              size='small'
              aria-label={t('downloadFilesAsZip')}
              disabled={workspaceActionsDisabled}
              onClick={onDownloadZip}
            >
              <Archive fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t('uploadFilesFromZip')}>
            <IconButton
              size='small'
              aria-label={t('uploadFilesFromZip')}
              disabled={workspaceActionsDisabled}
              onClick={onUploadZip}
            >
              <Unarchive fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      {loaded && (
        <Box
          data-testid='file-tree-dropzone'
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => setSelectedFolder('')}
          sx={{
            flex: 1,
            borderRadius: 1,
            // The whole zone is the target when files are dragged over the root.
            outline: (theme) =>
              dropTarget === ''
                ? `1px dashed ${theme.palette.primary.main}`
                : 'none',
            outlineOffset: -1,
            backgroundColor: dropTarget === '' ? 'action.hover' : 'transparent',
          }}
        >
          <SimpleTreeView
            selectedItems={activeFile}
            expandedItems={expandedItems}
            onExpandedItemsChange={(_, itemIds) => setExpandedItems(itemIds)}
            onSelectedItemsChange={(e, itemId) => {
              if (itemId === null) {
                return;
              }
              if (itemId.startsWith(FOLDER_PREFIX)) {
                setSelectedFolder(itemId.substring(FOLDER_PREFIX.length));
              } else {
                onOpenFile(itemId);
              }
              e?.stopPropagation();
            }}
            data-testid='file-tree'
          >
            {forest.map((node) => (
              <TreeNodeRow
                key={
                  node.type === 'file'
                    ? node.path
                    : `${FOLDER_PREFIX}${node.path}`
                }
                node={node}
                forest={forest}
                binaryFiles={binaryFiles}
                edit={edit}
                draftName={draftName}
                onDraftNameChange={setDraftName}
                onStartRename={onStartRename}
                onClearEdit={() => setEdit(null)}
                onRenameFile={onRenameFile}
                onRenameFolder={onRenameFolder}
                onDelete={askDelete}
                onDownloadFile={onDownloadFile}
                onOpenFile={onOpenFile}
                workspaceActionsDisabled={workspaceActionsDisabled}
                expandedItems={expandedItems}
                dropTarget={dropTarget}
                createRowFor={createRowFor}
              />
            ))}
            {createRowFor('')}
          </SimpleTreeView>
        </Box>
      )}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        hidden
        onChange={handleFilesChosen}
      />
    </Box>
  );
}
