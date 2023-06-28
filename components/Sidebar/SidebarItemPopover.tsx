import { Popover } from '@mui/material';

export default function SidebarItemPopover({
  children, id, anchorEl, onClose, open,
} : {
  children: React.ReactNode,
  id: string,
  anchorEl: HTMLElement | null,
  onClose: () => void,
  open: boolean,
}) {
  return (
    <Popover
      id={id}
      sx={{
        marginLeft: 1,
      }}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      onClose={onClose}
    >
      {children}
    </Popover>
  );
}
