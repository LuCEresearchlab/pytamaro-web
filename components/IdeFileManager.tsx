import {
  Archive,
  CreateNewFolderOutlined,
  DeleteOutlined,
  Download,
  DriveFileRenameOutline,
  Folder,
  FolderOpen,
  InsertDriveFile,
  MoreHoriz,
  NoteAddOutlined,
  Unarchive,
  UploadFileOutlined,
} from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';
import {
  Box,
  ClickAwayListener,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useConfirm } from 'material-ui-confirm';
import {
  ChangeEvent,
  DragEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isPythonFileName } from '../src/ide/files';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import theme from '../src/theme';
import SidebarTitle from './sidebar/SidebarTitle';

const FOLDER_PREFIX = 'dir:';

type FileTreeNode =
  | { type: 'file'; name: string; path: string }
  | { type: 'folder'; name: string; path: string; children: FileTreeNode[] };

/** What the inline name input is currently editing, if anything. */
type TreeEdit =
  | { mode: 'create'; kind: 'file' | 'folder'; parent: string }
  | { mode: 'rename'; path: string }
  | null;

/** Builds a folder tree from the flat, slash-separated paths of the workspace. */
function buildFileTree(
  paths: readonly string[],
  emptyFolders: readonly string[],
): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const folders = new Map<string, Extract<FileTreeNode, { type: 'folder' }>>();

  const ensureFolder = (segments: string[]): FileTreeNode[] => {
    let current = root;
    let prefix = '';
    segments.forEach((segment) => {
      prefix = prefix.length === 0 ? segment : `${prefix}/${segment}`;
      let folder = folders.get(prefix);
      if (folder === undefined) {
        folder = { type: 'folder', name: segment, path: prefix, children: [] };
        folders.set(prefix, folder);
        current.push(folder);
      }
      current = folder.children;
    });
    return current;
  };
  emptyFolders.forEach((path) => ensureFolder(path.split('/')));
  paths.forEach((path) => {
    const segments = path.split('/');
    ensureFolder(segments.slice(0, -1)).push({
      type: 'file',
      name: segments[segments.length - 1],
      path,
    });
  });

  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    nodes.sort((a, b) =>
      a.type === b.type
        ? a.name.localeCompare(b.name)
        : a.type === 'folder'
          ? -1
          : 1,
    );
    nodes.forEach((node) => {
      if (node.type === 'folder') {
        sortNodes(node.children);
      }
    });
    return nodes;
  };

  return sortNodes(root);
}

function folderItemIds(nodes: readonly FileTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.type === 'folder'
      ? [`${FOLDER_PREFIX}${node.path}`, ...folderItemIds(node.children)]
      : [],
  );
}

function joinPath(parent: string, name: string): string {
  return parent.length === 0 ? name : `${parent}/${name}`;
}

/** The folder that contains the given path ('' for the workspace root). */
function parentPath(path: string): string {
  const index = path.lastIndexOf('/');
  return index === -1 ? '' : path.slice(0, index);
}

/** Whether a drag carries files from the user's device (and not, say, text). */
function isFileDrag(event: DragEvent<HTMLElement>): boolean {
  return Array.from(event.dataTransfer.types).includes('Files');
}

/**
 * The folder a drag is currently over. Folder rows are marked with their own
 * path, file rows with the path of their parent folder, so dropping onto a
 * file uploads next to it. Anywhere else means the workspace root ('').
 */
function dropFolderOf(target: EventTarget): string {
  if (!(target instanceof Element)) {
    return '';
  }
  return (
    target.closest<HTMLElement>('[data-drop-folder]')?.dataset.dropFolder ?? ''
  );
}

function InlineNameInput({
  initialName = '',
  placeholder,
  onSubmit,
  onCancel,
  onNameChange = undefined,
}: {
  initialName?: string;
  placeholder: string;
  onSubmit: (name: string) => boolean;
  onCancel: () => void;
  onNameChange?: (name: string) => void;
}) {
  const { t } = useLocalTranslation(['ide']);
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setError(t('fileNameEmpty'));
      return;
    }
    if (!onSubmit(trimmedName)) {
      setError(t('fileNameUnavailable'));
    }
  };

  return (
    <TextField
      autoFocus
      size='small'
      type='text'
      fullWidth
      variant='standard'
      placeholder={placeholder}
      value={name}
      error={error !== null}
      helperText={error}
      sx={{ display: 'flex', flexGrow: 1, minWidth: 0 }}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        setName(event.target.value);
        onNameChange?.(event.target.value);
        setError(null);
      }}
      onFocus={(event) => event.target.select()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onCancel();
        }
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
          submit();
        } else if (event.key === 'Escape') {
          onCancel();
        }
      }}
    />
  );
}

function PythonFileIcon() {
  return (
    <Box
      component='img'
      src='/icons/python-logo.svg'
      alt=''
      sx={{ display: 'block', width: 18, height: 18 }}
    />
  );
}

/** The icon the tree shows next to a file, chosen by its kind and extension. */
function fileIcon(name: string, binary: boolean) {
  if (binary) {
    return InsertDriveFile;
  }
  return isPythonFileName(name) ? PythonFileIcon : DescriptionIcon;
}

const ACTIONS_VISIBLE_ROW = ':is(:hover, :focus-visible, :has(:focus-visible))';

const HOVER_ACTIONS_SX = {
  '& .tree-actions': { visibility: 'hidden' },
  '& .MuiTreeItem-label': { overflow: 'visible' },
  // Only the row itself, not the children that a folder's root contains.
  [`& > .MuiTreeItem-content${ACTIONS_VISIBLE_ROW} .tree-actions`]: {
    visibility: 'visible',
  },
};

/** Highlights the row of the folder that files are currently dragged over. */
const DROP_TARGET_SX = {
  '& > .MuiTreeItem-content': {
    backgroundColor: 'action.hover',
    outline: (theme: { palette: { primary: { main: string } } }) =>
      `1px dashed ${theme.palette.primary.main}`,
    outlineOffset: -1,
  },
};

function ActionButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip arrow title={title}>
      <IconButton
        size='small'
        aria-label={title}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

const ACTION_BUTTON_WIDTH = 30;
const ACTIONS_ANIMATION_MS = 180;

/** Makes a row name use the remaining width and ellipsize instead of overflowing. */
const ROW_NAME_SX = {
  flexGrow: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** A tree row: a label whose actions are tucked behind a "more" button on hover. */
function RowLabel({
  actions = undefined,
  actionCount,
  moreActionsLabel = undefined,
  closeActionsLabel = undefined,
  children,
}: {
  actions?: ReactNode;
  actionCount: number;
  moreActionsLabel?: string;
  closeActionsLabel?: string;
  children: ReactNode;
}) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // Rows have no actions while they are being renamed or created.
  const hasActions = actions !== undefined;
  const open = hasActions && actionsOpen;
  const close = () => setActionsOpen(false);

  const animate = (properties: string[], duration = ACTIONS_ANIMATION_MS) =>
    theme.transitions.create(properties, { duration });

  // The "more" button is always reserved while hovering; when open, the
  // unfolded actions next to it are reserved as well.
  const reservedSpace = {
    paddingRight: `${(open ? actionCount + 1 : 1) * ACTION_BUTTON_WIDTH}px`,
  };
  const toggleLabel = open ? closeActionsLabel : moreActionsLabel;

  return (
    <Stack
      direction='row'
      spacing={1}
      sx={{
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        paddingRight: 0.5,
        transition: animate(['padding-right']),
        // The actions are positioned absolutely. Reserve room for them only
        // while they are shown (the row is hovered, has keyboard focus, or is
        // open), so names can use the full width the rest of the time.
        ...(hasActions && {
          ...(open && reservedSpace),
          [`.MuiTreeItem-content${ACTIONS_VISIBLE_ROW} &`]: reservedSpace,
        }),
      }}
    >
      {children}
      {hasActions && (
        // Clicking elsewhere folds the actions away. The listener is only
        // active while they are open.
        <ClickAwayListener
          onClickAway={close}
          mouseEvent={open ? 'onPointerDown' : false}
          touchEvent={false}
        >
          <Stack
            className='tree-actions'
            // The button comes first in the DOM so that Tab reaches it before
            // the actions it opens, while it still sits to their right.
            direction='row-reverse'
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            // Keep the open actions visible even when the pointer leaves the
            // row, which the hover styles would otherwise hide.
            style={{ visibility: open ? 'visible' : undefined }}
            // Nothing in here may reach the tree item and open the file.
            onClick={(event) => event.stopPropagation()}
            // Fold away when focus moves out of the actions.
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                close();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                moreButtonRef.current?.focus();
                close();
              }
            }}
          >
            <Tooltip arrow title={toggleLabel}>
              <IconButton
                ref={moreButtonRef}
                size='small'
                aria-label={toggleLabel}
                aria-expanded={open}
                onClick={(event) => {
                  // Safari doesn't focus buttons on click; Escape needs focus.
                  event.currentTarget.focus();
                  setActionsOpen(!open);
                }}
                sx={{
                  transition: animate(['color']),
                  ...(open && {
                    color: 'primary.main',
                  }),
                }}
              >
                <MoreHoriz fontSize='small' />
              </IconButton>
            </Tooltip>
            <Box
              // Closed actions cannot be tabbed into.
              inert={!open}
              // Capturing lets the action itself run while the strip folds up.
              onClickCapture={close}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                overflow: 'hidden',
                width: open ? `${actionCount * ACTION_BUTTON_WIDTH}px` : 0,
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
                transition: [
                  animate(['width']),
                  animate(['opacity'], open ? 140 : 80),
                ].join(', '),
                '& > *': {
                  flexShrink: 0,
                  opacity: open ? 1 : 0,
                  transform: open ? 'none' : 'translateX(8px)',
                  transition: animate(['opacity', 'transform']),
                },
                // Unfold from the button outwards, fold back inwards.
                ...Object.fromEntries(
                  Array.from({ length: actionCount }, (_, index) => [
                    `& > *:nth-of-type(${index + 1})`,
                    {
                      transitionDelay: `${
                        open ? (actionCount - 1 - index) * 20 : index * 10
                      }ms`,
                    },
                  ]),
                ),
              }}
            >
              {actions}
            </Box>
          </Stack>
        </ClickAwayListener>
      )}
    </Stack>
  );
}

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

  const tree = useMemo(
    () => buildFileTree(fileNames, folderNames),
    [fileNames, folderNames],
  );
  const folderItems = useMemo(() => folderItemIds(tree), [tree]);
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
    const appeared = folderItems.filter((itemId) => !known.has(itemId));
    knownFoldersRef.current = new Set(folderItems);
    if (appeared.length > 0) {
      setExpandedItems((previous) => [
        ...previous,
        ...appeared.filter((itemId) => !previous.includes(itemId)),
      ]);
    }
  }, [folderItems]);

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

  const renderFile = (node: Extract<FileTreeNode, { type: 'file' }>) => {
    const { path, name } = node;
    const isRenaming = edit?.mode === 'rename' && edit.path === path;
    return (
      <TreeItem
        key={path}
        itemId={path}
        slots={{
          icon: fileIcon(isRenaming ? draftName : path, binaryFiles.has(path)),
        }}
        sx={HOVER_ACTIONS_SX}
        data-drop-folder={parentPath(path)}
        label={
          <RowLabel
            actionCount={3}
            moreActionsLabel={t('moreActions')}
            closeActionsLabel={t('closeActions')}
            actions={
              isRenaming ? undefined : (
                <>
                  <ActionButton
                    title={t('downloadFile')}
                    onClick={() => onDownloadFile(path)}
                  >
                    <Download fontSize='small' />
                  </ActionButton>
                  <ActionButton
                    title={t('renameFile')}
                    onClick={() => {
                      setDraftName(path);
                      setEdit({ mode: 'rename', path });
                    }}
                  >
                    <DriveFileRenameOutline fontSize='small' />
                  </ActionButton>
                  <ActionButton
                    title={t('deleteFile')}
                    onClick={() => askDelete(path, false)}
                  >
                    <DeleteOutlined fontSize='small' />
                  </ActionButton>
                </>
              )
            }
          >
            {isRenaming ? (
              <InlineNameInput
                initialName={path}
                placeholder={t('fileName')}
                onNameChange={setDraftName}
                onSubmit={(newPath) => {
                  if (newPath === path || onRenameFile(path, newPath)) {
                    setEdit(null);
                    return true;
                  }
                  return false;
                }}
                onCancel={() => setEdit(null)}
              />
            ) : (
              <Typography variant='body2' sx={ROW_NAME_SX}>
                {name}
              </Typography>
            )}
          </RowLabel>
        }
        onClick={() => {
          if (!isRenaming) {
            onOpenFile(path);
          }
        }}
      />
    );
  };

  const renderNode = (node: FileTreeNode): ReactNode => {
    if (node.type === 'file') {
      return renderFile(node);
    }
    const itemId = `${FOLDER_PREFIX}${node.path}`;
    const isRenaming = edit?.mode === 'rename' && edit.path === node.path;
    return (
      <TreeItem
        key={itemId}
        itemId={itemId}
        slots={{ icon: expandedItems.includes(itemId) ? FolderOpen : Folder }}
        sx={[HOVER_ACTIONS_SX, dropTarget === node.path && DROP_TARGET_SX]}
        data-drop-folder={node.path}
        label={
          <RowLabel
            actionCount={5}
            moreActionsLabel={t('moreActions')}
            closeActionsLabel={t('closeActions')}
            actions={
              isRenaming ? undefined : (
                <>
                  <ActionButton
                    title={t('addEmptyFile')}
                    onClick={() => startCreate('file', node.path)}
                  >
                    <NoteAddOutlined fontSize='small' />
                  </ActionButton>
                  <ActionButton
                    title={t('addFileFromDevice')}
                    onClick={() => pickFiles(node.path)}
                  >
                    <UploadFileOutlined fontSize='small' />
                  </ActionButton>
                  <ActionButton
                    title={t('addFolder')}
                    onClick={() => startCreate('folder', node.path)}
                  >
                    <CreateNewFolderOutlined fontSize='small' />
                  </ActionButton>
                  <ActionButton
                    title={t('renameFolder')}
                    onClick={() => {
                      setDraftName(node.path);
                      setEdit({ mode: 'rename', path: node.path });
                    }}
                  >
                    <DriveFileRenameOutline fontSize='small' />
                  </ActionButton>
                  <ActionButton
                    title={t('deleteFolder')}
                    onClick={() => askDelete(node.path, true)}
                  >
                    <DeleteOutlined fontSize='small' />
                  </ActionButton>
                </>
              )
            }
          >
            {isRenaming ? (
              <InlineNameInput
                initialName={node.path}
                placeholder={t('folderName')}
                onNameChange={setDraftName}
                onSubmit={(newPath) => {
                  if (
                    newPath === node.path ||
                    onRenameFolder(node.path, newPath)
                  ) {
                    setEdit(null);
                    return true;
                  }
                  return false;
                }}
                onCancel={() => setEdit(null)}
              />
            ) : (
              <Typography variant='body2' sx={ROW_NAME_SX}>
                {node.name}
              </Typography>
            )}
          </RowLabel>
        }
      >
        {createRowFor(node.path)}
        {node.children.map(renderNode)}
      </TreeItem>
    );
  };

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
              onClick={() => startCreate('file', '')}
              data-testid='new-file-button'
            >
              <NoteAddOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t('addFileFromDevice')}>
            <IconButton
              size='small'
              aria-label={t('addFileFromDevice')}
              onClick={() => pickFiles('')}
              data-testid='upload-file-button'
            >
              <UploadFileOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t('addFolder')}>
            <IconButton
              size='small'
              aria-label={t('addFolder')}
              onClick={() => startCreate('folder', '')}
              data-testid='new-folder-button'
            >
              <CreateNewFolderOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t('downloadFilesAsZip')}>
            <IconButton
              size='small'
              aria-label={t('downloadFilesAsZip')}
              onClick={onDownloadZip}
            >
              <Archive fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t('uploadFilesFromZip')}>
            <IconButton
              size='small'
              aria-label={t('uploadFilesFromZip')}
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
            onSelectedItemsChange={(_, itemId) => {
              if (itemId !== null && !itemId.startsWith(FOLDER_PREFIX)) {
                onOpenFile(itemId);
              }
            }}
            data-testid='file-tree'
          >
            {tree.map(renderNode)}
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
