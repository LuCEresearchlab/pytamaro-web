import { Chip, Stack, TablePagination } from '@mui/material';
import { useState } from 'react';
import { ToolboxFunction } from '../../src/localStorage/schema';
import useLocalToolbox from '../../src/localStorage/useLocalToolbox';
import theme from '../../src/theme';
import ToolboxFunctionCard from '../ToolboxFunctionCard';
import { SIDEBAR_CHIPS_FONT_SIZE, SIDEBAR_CHIPS_WIDTH } from './Sidebar';
import SidebarItem from './SidebarItem';
import SidebarItemPopover from './SidebarItemPopover';

function SidebarToolboxFunction({ fn }: { fn: ToolboxFunction }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const toolboxPopoverId = `toolbox-popover-${fn.name}`;
  return (
    <>
      <Chip
        label={fn.name}
        size="small"
        variant="filled"
        aria-owns={open ? toolboxPopoverId : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{
          width: SIDEBAR_CHIPS_WIDTH,
          fontFamily: theme.pytamaro.monospaceFontFamily,
          fontSize: SIDEBAR_CHIPS_FONT_SIZE,
        }}
      />
      <SidebarItemPopover
        id={toolboxPopoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        <ToolboxFunctionCard fn={fn} summary />
      </SidebarItemPopover>
    </>
  );
}

export default function ToolboxListSidebar() {
  const { list } = useLocalToolbox();
  const [page, setPage] = useState(0);
  const fnsPerPage = 20;
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const toolboxFunctions = list();
  return toolboxFunctions.length > 0 ? (
    <SidebarItem title="My Toolbox">
      <Stack
        spacing={1}
      >
        {toolboxFunctions.slice(fnsPerPage * page, fnsPerPage * (page + 1)).map((fn) => (
          <SidebarToolboxFunction key={fn.name} fn={fn} />
        ))}
      </Stack>
      {toolboxFunctions.length > fnsPerPage ? (
        <TablePagination
          component="div"
          count={toolboxFunctions.length}
          page={page}
          rowsPerPageOptions={[]}
          onPageChange={handleChangePage}
          rowsPerPage={fnsPerPage}
          sx={{
            '& .MuiTablePagination-spacer': {
              display: 'none',
            },
          }}
        />
      ) : null}
    </SidebarItem>
  ) : null;
}
