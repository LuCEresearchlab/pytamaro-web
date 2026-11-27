import { Folder, FolderOpen, MoreHoriz } from '@mui/icons-material';
import {
  Box,
  ClickAwayListener,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import theme from '../../../src/theme';
import { TreeItem } from '@mui/x-tree-view';
import useLocalTranslation from '../../../src/localStorage/useLocalTranslation';
import { fileIcon, InlineNameInput } from './InlineNameInput';
import { FileActions, FolderActions, RowActionsProps } from './treeNodeActions';
import {
  FileNode,
  FileTreeNode,
  FolderNode,
  TreeEdit,
  parentPath,
  FOLDER_PREFIX,
} from './utils';

/**
 * The "rename or display" half of a tree row.
 */
function RowName({
  isRenaming,
  displayName,
  placeholder,
  sourcePath,
  onDraftNameChange,
  onRename,
  onClearEdit,
  children,
}: {
  isRenaming: boolean;
  displayName: string;
  placeholder: string;
  sourcePath: string;
  children: ReactNode;
} & Pick<RowActionsProps, 'onDraftNameChange' | 'onRename' | 'onClearEdit'>) {
  const { t } = useLocalTranslation(['ide']);
  return (
    <RowLabel
      actionCount={3}
      moreActionsLabel={t('moreActions')}
      closeActionsLabel={t('closeActions')}
      actions={isRenaming ? undefined : children}
    >
      {isRenaming ? (
        <InlineNameInput
          initialName={sourcePath}
          placeholder={placeholder}
          onNameChange={onDraftNameChange}
          onSubmit={(newPath) => {
            if (newPath === sourcePath || onRename(sourcePath, newPath)) {
              onClearEdit();
              return true;
            }
            return false;
          }}
          onCancel={onClearEdit}
        />
      ) : (
        <Typography variant='body2' sx={ROW_NAME_SX}>
          {displayName}
        </Typography>
      )}
    </RowLabel>
  );
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

/**
 * Highlights the row of the folder that files are currently dragged over.
 */
const DROP_TARGET_SX = {
  '& > .MuiTreeItem-content': {
    backgroundColor: 'action.hover',
    outline: (theme: { palette: { primary: { main: string } } }) =>
      `1px dashed ${theme.palette.primary.main}`,
    outlineOffset: -1,
  },
};

const ACTION_BUTTON_WIDTH = 30;
const ACTIONS_ANIMATION_MS = 180;

/**
 * Makes a row name use the remaining width and ellipsize instead of overflowing.
 */
const ROW_NAME_SX = {
  flexGrow: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/**
 * A tree row's label: the name plus a strip of actions tucked behind a "more"
 * button that unfolds on hover.
 */
export function RowLabel({
  actionCount,
  actions = undefined,
  moreActionsLabel = undefined,
  closeActionsLabel = undefined,
  actionsDisabled = false,
  children,
}: {
  actionCount: number;
  actions?: ReactNode;
  moreActionsLabel?: string;
  closeActionsLabel?: string;
  actionsDisabled?: boolean;
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
      onContextMenu={(e) => {
        e.preventDefault();
        if (hasActions && !actionsOpen) {
          setActionsOpen(true);
        }
      }}
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
                disabled={actionsDisabled}
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

function FileRow({
  node,
  edit,
  draftName,
  onDraftNameChange,
  onStartRename,
  onClearEdit,
  binaryFiles,
  forest,
  onDownloadFile,
  onRenameFile,
  onOpenFile,
  onDelete,
  workspaceActionsDisabled,
}: {
  node: FileNode;
  edit: TreeEdit | null;
  draftName: string;
  onDraftNameChange: (name: string) => void;
  onStartRename: (path: string) => void;
  onClearEdit: () => void;
  binaryFiles: Set<string>;
  forest: FileTreeNode[];
  onDownloadFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => boolean;
  onOpenFile: (path: string) => void;
  onDelete: (path: string, isFolder: boolean) => void;
  workspaceActionsDisabled: boolean;
}) {
  const { t } = useLocalTranslation(['ide', 'common']);
  const { path, name } = node;
  const isRenaming = edit?.mode === 'rename' && edit.path === path;
  return (
    <TreeItem
      itemId={path}
      slots={{
        icon: fileIcon(isRenaming ? draftName : path, binaryFiles.has(path)),
      }}
      sx={HOVER_ACTIONS_SX}
      data-drop-folder={parentPath(path)}
      label={
        <RowName
          displayName={name}
          sourcePath={path}
          placeholder={t('fileName')}
          isRenaming={isRenaming}
          onDraftNameChange={onDraftNameChange}
          onRename={onRenameFile}
          onClearEdit={onClearEdit}
        >
          <FileActions
            path={path}
            forest={forest}
            onDownloadFile={onDownloadFile}
            onStartRename={onStartRename}
            onRename={onRenameFile}
            onDelete={onDelete}
            workspaceActionsDisabled={workspaceActionsDisabled}
          />
        </RowName>
      }
      onClick={() => {
        if (!isRenaming) {
          onOpenFile(path);
        }
      }}
    />
  );
}

function FolderRow({
  node,
  edit,
  onDraftNameChange,
  onStartRename,
  onClearEdit,
  forest,
  onRenameFolder,
  onDelete,
  workspaceActionsDisabled,
  expandedItems,
  dropTarget,
  createRowFor,
  children,
}: {
  node: FolderNode;
  edit: TreeEdit | null;
  onDraftNameChange: (name: string) => void;
  onStartRename: (path: string) => void;
  onClearEdit: () => void;
  forest: FileTreeNode[];
  onRenameFolder: (oldPath: string, newPath: string) => boolean;
  onDelete: (path: string, isFolder: boolean) => void;
  workspaceActionsDisabled: boolean;
  expandedItems: string[];
  dropTarget: string | null;
  createRowFor: (parent: string) => ReactNode;
  children: ReactNode;
}) {
  const { t } = useLocalTranslation(['ide', 'common']);
  const itemId = `${FOLDER_PREFIX}${node.path}`;
  const isRenaming = edit?.mode === 'rename' && edit.path === node.path;
  return (
    <TreeItem
      itemId={itemId}
      slots={{ icon: expandedItems.includes(itemId) ? FolderOpen : Folder }}
      sx={[HOVER_ACTIONS_SX, dropTarget === node.path && DROP_TARGET_SX]}
      data-drop-folder={node.path}
      label={
        <RowLabel
          actionCount={3}
          moreActionsLabel={t('moreActions')}
          closeActionsLabel={t('closeActions')}
          actions={
            isRenaming ? undefined : (
              <FolderActions
                path={node.path}
                forest={forest}
                onStartRename={onStartRename}
                onRename={onRenameFolder}
                onDelete={onDelete}
                workspaceActionsDisabled={workspaceActionsDisabled}
              />
            )
          }
        >
          {isRenaming ? (
            <InlineNameInput
              initialName={node.path}
              placeholder={t('folderName')}
              onNameChange={onDraftNameChange}
              onSubmit={(newPath) => {
                if (
                  newPath === node.path ||
                  onRenameFolder(node.path, newPath)
                ) {
                  onClearEdit();
                  return true;
                }
                return false;
              }}
              onCancel={onClearEdit}
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
      {children}
    </TreeItem>
  );
}

export default function TreeNodeRow({
  node,
  edit,
  draftName,
  onDraftNameChange,
  onStartRename,
  onClearEdit,
  binaryFiles,
  forest,
  onRenameFile,
  onRenameFolder,
  onDelete,
  onDownloadFile,
  onOpenFile,
  workspaceActionsDisabled,
  expandedItems,
  dropTarget,
  createRowFor,
}: {
  node: FileTreeNode;
  edit: TreeEdit | null;
  draftName: string;
  onDraftNameChange: (name: string) => void;
  onStartRename: (path: string) => void;
  onClearEdit: () => void;
  binaryFiles: Set<string>;
  forest: FileTreeNode[];
  onRenameFile: (oldPath: string, newPath: string) => boolean;
  onRenameFolder: (oldPath: string, newPath: string) => boolean;
  onDelete: (path: string, isFolder: boolean) => void;
  onDownloadFile: (path: string) => void;
  onOpenFile: (path: string) => void;
  workspaceActionsDisabled: boolean;
  expandedItems: string[];
  dropTarget: string | null;
  createRowFor: (parent: string) => ReactNode;
}) {
  return node.type === 'file' ? (
    <FileRow
      key={node.path}
      node={node}
      edit={edit}
      draftName={draftName}
      onDraftNameChange={onDraftNameChange}
      onStartRename={onStartRename}
      onClearEdit={onClearEdit}
      binaryFiles={binaryFiles}
      forest={forest}
      onDownloadFile={onDownloadFile}
      onRenameFile={onRenameFile}
      onOpenFile={onOpenFile}
      onDelete={onDelete}
      workspaceActionsDisabled={workspaceActionsDisabled}
    />
  ) : (
    <FolderRow
      key={`${FOLDER_PREFIX}${node.path}`}
      node={node}
      edit={edit}
      onDraftNameChange={onDraftNameChange}
      onStartRename={onStartRename}
      onClearEdit={onClearEdit}
      forest={forest}
      onRenameFolder={onRenameFolder}
      onDelete={onDelete}
      workspaceActionsDisabled={workspaceActionsDisabled}
      expandedItems={expandedItems}
      dropTarget={dropTarget}
      createRowFor={createRowFor}
    >
      {node.children.map((child) => (
        <TreeNodeRow
          key={child.path}
          node={child}
          edit={edit}
          draftName={draftName}
          onDraftNameChange={onDraftNameChange}
          onStartRename={onStartRename}
          onClearEdit={onClearEdit}
          binaryFiles={binaryFiles}
          forest={forest}
          onRenameFile={onRenameFile}
          onRenameFolder={onRenameFolder}
          onDelete={onDelete}
          onDownloadFile={onDownloadFile}
          onOpenFile={onOpenFile}
          workspaceActionsDisabled={workspaceActionsDisabled}
          expandedItems={expandedItems}
          dropTarget={dropTarget}
          createRowFor={createRowFor}
        />
      ))}
    </FolderRow>
  );
}
