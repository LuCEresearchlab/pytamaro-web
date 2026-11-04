import {
  CreateNewFolderOutlined,
  DeleteOutlined,
  DriveFileRenameOutline,
  Folder,
  FolderOpen,
  InsertDriveFile,
  LockOutlined,
  NoteAddOutlined,
  UploadFile,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useConfirm } from 'material-ui-confirm';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { isPythonFileName } from '../src/ideFiles';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';

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

function InlineNameInput({
  initialName = '',
  placeholder,
  onSubmit,
  onCancel,
}: {
  initialName?: string;
  placeholder: string;
  onSubmit: (name: string) => boolean;
  onCancel: () => void;
}) {
  const { t } = useLocalTranslation(['common']);
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

/** The icon the tree shows next to a file, chosen by its extension. */
function fileIcon(name: string) {
  return isPythonFileName(name) ? PythonFileIcon : InsertDriveFile;
}

const HOVER_ACTIONS_SX = {
  '& .tree-actions': { visibility: 'hidden' },
  // Only the row itself, not the children that a folder's root contains.
  '& > .MuiTreeItem-content:hover .tree-actions, & > .MuiTreeItem-content:focus-within .tree-actions':
    { visibility: 'visible' },
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

/** A tree row: a label with actions that show up on hover. */
function RowLabel({
  actions = undefined,
  actionCount,
  children,
}: {
  actions?: ReactNode;
  actionCount: number;
  children: ReactNode;
}) {
  return (
    <Stack
      direction='row'
      spacing={1}
      sx={{
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        paddingRight: actions === undefined ? 0.5 : actionCount * 3.5,
      }}
    >
      {children}
      {actions !== undefined && (
        <Stack
          className='tree-actions'
          direction='row'
          spacing={0.25}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export type IdeFileTreeProps = {
  fileNames: readonly string[];
  folderNames: readonly string[];
  readOnlyFiles: ReadonlySet<string>;
  activeFile: string;
  onOpenFile: (path: string) => void;
  onAddFile: (path: string) => boolean;
  onAddFolder: (path: string) => boolean;
  onRenameFile: (oldPath: string, newPath: string) => boolean;
  onRenameFolder: (oldPath: string, newPath: string) => boolean;
  onDeleteFile: (path: string) => void;
  onDeleteFolder: (path: string) => void;
  onUploadFile: () => void;
};

/**
 * The files and folders of the IDE workspace. Files and folders can be created
 * inside any folder (through its hover actions) or at the root (through the
 * buttons under the tree).
 */
export default function IdeFileTree({
  fileNames,
  folderNames,
  readOnlyFiles,
  activeFile,
  onOpenFile,
  onAddFile,
  onAddFolder,
  onRenameFile,
  onRenameFolder,
  onDeleteFile,
  onDeleteFolder,
  onUploadFile,
}: IdeFileTreeProps) {
  const { t } = useLocalTranslation(['common']);
  const confirm = useConfirm();
  const [edit, setEdit] = useState<TreeEdit>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const tree = useMemo(
    () => buildFileTree(fileNames, folderNames),
    [fileNames, folderNames],
  );
  const folderItems = useMemo(() => folderItemIds(tree), [tree]);

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
    setEdit({ mode: 'create', kind, parent });
  };

  const askDelete = (path: string, isFolder: boolean) => {
    const prefix = isFolder ? 'deleteFolder' : 'deleteFile';
    confirm({
      title: t(`${prefix}AreYouSure`),
      description: t(`${prefix}Warning`, { name: path }),
      confirmationText: t(prefix),
      cancellationText: t('confirmCancel'),
    }).then(({ confirmed }) => {
      if (confirmed) {
        (isFolder ? onDeleteFolder : onDeleteFile)(path);
      }
    });
  };

  const renderCreateRow = (kind: 'file' | 'folder', parent: string) => (
    <TreeItem
      key={`__new-${kind}__`}
      itemId={`__new-${kind}__:${parent}`}
      slots={{ icon: kind === 'file' ? InsertDriveFile : Folder }}
      label={
        <RowLabel actionCount={0}>
          <InlineNameInput
            placeholder={t(kind === 'file' ? 'fileName' : 'folderName')}
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
    const isReadOnly = readOnlyFiles.has(path);
    const isRenaming = edit?.mode === 'rename' && edit.path === path;
    const showActions = !isReadOnly && !isRenaming;
    return (
      <TreeItem
        key={path}
        itemId={path}
        slots={{ icon: fileIcon(path) }}
        sx={HOVER_ACTIONS_SX}
        label={
          <RowLabel
            actionCount={2}
            actions={
              showActions ? (
                <>
                  <ActionButton
                    title={t('renameFile')}
                    onClick={() => setEdit({ mode: 'rename', path })}
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
              ) : undefined
            }
          >
            {isRenaming ? (
              <InlineNameInput
                initialName={path}
                placeholder={t('fileName')}
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
              <Typography
                variant='body2'
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </Typography>
            )}
            {isReadOnly && (
              <Tooltip arrow title={t('readOnly')}>
                <LockOutlined fontSize='small' color='disabled' />
              </Tooltip>
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
        sx={HOVER_ACTIONS_SX}
        label={
          <RowLabel
            actionCount={4}
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
                    title={t('addFolder')}
                    onClick={() => startCreate('folder', node.path)}
                  >
                    <CreateNewFolderOutlined fontSize='small' />
                  </ActionButton>
                  <ActionButton
                    title={t('renameFolder')}
                    onClick={() => setEdit({ mode: 'rename', path: node.path })}
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
              <Typography variant='body2'>{node.name}</Typography>
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
    <>
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
      <Stack direction='row' sx={{ marginTop: 1 }}>
        <ActionButton
          title={t('addEmptyFile')}
          onClick={() => startCreate('file', '')}
        >
          <NoteAddOutlined fontSize='small' data-testid='new-file-button' />
        </ActionButton>
        <ActionButton
          title={t('addFolder')}
          onClick={() => startCreate('folder', '')}
        >
          <CreateNewFolderOutlined fontSize='small' />
        </ActionButton>
        <ActionButton title={t('addFileFromDevice')} onClick={onUploadFile}>
          <UploadFile fontSize='small' />
        </ActionButton>
      </Stack>
    </>
  );
}
