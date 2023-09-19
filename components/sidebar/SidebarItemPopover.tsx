import { Popover } from '@mui/material';

export default function SidebarItemPopover({
  children, id, anchorEl, onClose, open, fromRight = false,
} : {
  children: React.ReactNode,
  id: string,
  anchorEl: HTMLElement | null,
  onClose: () => void,
  open: boolean,
  fromRight?: boolean,
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
        horizontal: fromRight ? 'left' : 'right',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: fromRight ? 'right' : 'left',
      }}
      onClose={onClose}
    >
      {children}
    </Popover>
  );
}
