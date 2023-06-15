import {
  RestartAlt, ContentCopy, VisibilityOff, Visibility, MoreVert,
} from '@mui/icons-material';
import {
  IconButton, Menu, MenuItem, ListItemIcon,
} from '@mui/material';
import { useState } from 'react';
import { CodeCellState, CodeCellExecutionState } from '../src/localStorage/schema';

export default function MoreOptionsButton({
  codeCellState, codeCellExecutionState, onShowHideOutput, onReset,
} :
{ codeCellState: CodeCellState, codeCellExecutionState: CodeCellExecutionState,
  onShowHideOutput: () => void, onReset: () => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCopy = () => {
    handleClose();
    navigator.clipboard.writeText(codeCellState.source);
  };
  const handleShowHideOutputArea = () => {
    handleClose();
    onShowHideOutput();
  };
  const handleReset = () => {
    handleClose();
    onReset();
  };
  return (
    <>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          },
        }}
      >
        <MenuItem onClick={handleReset}>
          <ListItemIcon>
            <RestartAlt fontSize="small" />
          </ListItemIcon>
          Reset Cell
        </MenuItem>
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          Copy Code
        </MenuItem>
        { codeCellExecutionState.executionResponse && (
        <MenuItem onClick={handleShowHideOutputArea}>
          <ListItemIcon>
            { codeCellExecutionState.outputAreaVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </ListItemIcon>
          { codeCellExecutionState.outputAreaVisible ? 'Hide' : 'Show' }
          {' '}
          Output
        </MenuItem>
        )}
      </Menu>
    </>
  );
}
