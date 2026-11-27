import {
  DeleteOutlined,
  Download,
  DriveFileMove,
  DriveFileRenameOutline,
  FolderOpen,
} from '@mui/icons-material';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import useLocalTranslation from '../../../src/localStorage/useLocalTranslation';
import { folderItems, FolderNode, type FileTreeNode } from './utils';
import { TreeItem, SimpleTreeView } from '@mui/x-tree-view';
import { baseName } from '../../../src/ide/files';

/**
 * The callbacks a tree row (file or folder) needs to render its name and its
 * hover actions.
 */
export type RowActionsProps = {
  path: string;
  forest: FileTreeNode[];
  onClearEdit: () => void;
  onDraftNameChange: (name: string) => void;
  onStartRename: (path: string) => void;
  onRename: (path: string, newPath: string) => boolean;
  onDelete: (path: string, isFolder: boolean) => void;
  onDownloadFile: (path: string) => void;
  workspaceActionsDisabled: boolean;
};

function ActionButton({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip arrow title={title}>
      <IconButton
        size='small'
        aria-label={title}
        disabled={disabled}
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

function MoveDialog({
  source,
  isFolder,
  open,
  setOpen,
  disabled,
  forest,
  moveFileNode,
}: {
  source: string;
  isFolder: boolean;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  disabled: boolean;
  forest: FileTreeNode[];
  moveFileNode: (oldPath: string, newPath: string) => boolean;
}) {
  const { t } = useLocalTranslation(['ide', 'common']);

  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);

  const sourceName = baseName(source);

  const handleClose = () => {
    setOpen(false);
    // Clear selection on close
    setError(null);
    setTarget(null);
  };

  const onItemSelected = (itemId: string | null) => {
    if (itemId === null) {
      setTarget(null);
    } else {
      const newTarget =
        itemId.length === 0 ? sourceName : `${itemId}/${sourceName}`;

      if (source === newTarget) {
        // Cannot move to the current location
        setError(t('move.error.no_change'));
      } else if (isFolder && newTarget.startsWith(source)) {
        // Cannot move a directory inside of itself
        setError(t('move.error.itself'));
      } else {
        setError(null);
        setTarget(newTarget);
      }
    }
  };

  const folders = ['', ...folderItems(forest).map((folder) => folder.path)];

  const moveNode = () => {
    if (target === null) {
      return;
    }
    if (moveFileNode(source, target)) {
      setOpen(false);
    } else {
      setError(t('move.error.failure', { destination: target }));
    }
  };

  const renderNode = (node: FolderNode) => (
    <TreeItem
      key={`move_target_${node.path}`}
      itemId={node.path}
      label={node.name}
    >
      {node.children
        .filter((child) => child.type === 'folder')
        .map((child) => renderNode(child))}
    </TreeItem>
  );

  return (
    <Dialog open={open && !disabled} fullWidth onClose={handleClose}>
      <DialogTitle>{t('move.title', { source: sourceName })}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('move.description')}</DialogContentText>
        <SimpleTreeView
          expandedItems={folders}
          onSelectedItemsChange={(_, itemId) => onItemSelected(itemId)}
          slots={{
            collapseIcon: FolderOpen,
            endIcon: FolderOpen,
          }}
          sx={{
            marginBottom: 2,
          }}
        >
          <TreeItem key={`move_target_`} itemId={''} label={t('move.root')}>
            {forest
              .filter((node): node is FolderNode => node.type === 'folder')
              .map(renderNode)}
          </TreeItem>
        </SimpleTreeView>
        {error === null ? <></> : <Alert severity='error'>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => setOpen(false)}>
          {t('common:confirmCancel')}
        </Button>
        <Button onClick={() => moveNode()} disabled={error !== null}>
          {t('move.action')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MoveNodeButton({
  source,
  isFolder,
  forest,
  moveFileNode,
  disabled,
}: {
  source: string;
  isFolder: boolean;
  forest: FileTreeNode[];
  moveFileNode: (oldPath: string, newPath: string) => boolean;
  disabled: boolean;
}) {
  const { t } = useLocalTranslation(['ide', 'common']);
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionButton
        title={t('move.action')}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <DriveFileMove fontSize='small' />
      </ActionButton>
      <MoveDialog
        source={source}
        isFolder={isFolder}
        open={open}
        setOpen={setOpen}
        disabled={disabled}
        forest={forest}
        moveFileNode={moveFileNode}
      />
    </>
  );
}

export function FileActions({
  path,
  forest,
  onDownloadFile,
  onStartRename,
  onRename,
  onDelete,
  workspaceActionsDisabled,
}: Pick<
  RowActionsProps,
  | 'path'
  | 'forest'
  | 'onDownloadFile'
  | 'onStartRename'
  | 'onRename'
  | 'onDelete'
  | 'workspaceActionsDisabled'
>) {
  const { t } = useLocalTranslation(['ide', 'common']);
  return (
    <>
      <ActionButton
        title={t('downloadFile')}
        disabled={workspaceActionsDisabled}
        onClick={() => onDownloadFile(path)}
      >
        <Download fontSize='small' />
      </ActionButton>
      <ActionButton
        title={t('renameFile')}
        disabled={workspaceActionsDisabled}
        onClick={() => onStartRename(path)}
      >
        <DriveFileRenameOutline fontSize='small' />
      </ActionButton>
      <MoveNodeButton
        source={path}
        isFolder={false}
        forest={forest}
        moveFileNode={onRename}
        disabled={workspaceActionsDisabled}
      />
      <ActionButton
        title={t('deleteFile')}
        disabled={workspaceActionsDisabled}
        onClick={() => onDelete(path, false)}
      >
        <DeleteOutlined fontSize='small' />
      </ActionButton>
    </>
  );
}

export function FolderActions({
  path,
  forest,
  onStartRename,
  onRename,
  onDelete,
  workspaceActionsDisabled,
}: Pick<
  RowActionsProps,
  | 'path'
  | 'forest'
  | 'onStartRename'
  | 'onRename'
  | 'onDelete'
  | 'workspaceActionsDisabled'
>) {
  const { t } = useLocalTranslation(['ide', 'common']);
  return (
    <>
      <ActionButton
        title={t('renameFolder')}
        disabled={workspaceActionsDisabled}
        onClick={() => onStartRename(path)}
      >
        <DriveFileRenameOutline fontSize='small' />
      </ActionButton>
      <MoveNodeButton
        source={path}
        isFolder={true}
        forest={forest}
        moveFileNode={onRename}
        disabled={workspaceActionsDisabled}
      />
      <ActionButton
        title={t('deleteFolder')}
        disabled={workspaceActionsDisabled}
        onClick={() => onDelete(path, true)}
      >
        <DeleteOutlined fontSize='small' />
      </ActionButton>
    </>
  );
}
