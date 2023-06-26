import {
  Chip,
  Popover,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { ToolboxFunction } from '../../src/localStorage/schema';
import useLocalToolbox from '../../src/localStorage/useLocalToolbox';
import theme from '../../src/theme';
import ToolboxFunctionCard from '../ToolboxFunctionCard';
import SidebarTitle from './SidebarTitle';

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
          maxWidth: '25ch',
          fontFamily: theme.pytamaro.monospaceFontFamily,
          fontSize: theme.typography.pxToRem(13),
        }}
      />
      <Popover
        id={toolboxPopoverId}
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
        onClose={handleClose}
      >
        <ToolboxFunctionCard fn={fn} summary />
      </Popover>
    </>
  );
}

export default function ToolboxListSidebar() {
  const { list } = useLocalToolbox();
  const toolboxFunctions = list();
  return toolboxFunctions.length > 0 ? (
    <>
      <SidebarTitle>
        My Toolbox
      </SidebarTitle>
      <Stack
        spacing={1}
      >
        {toolboxFunctions.map((fn) => (
          <SidebarToolboxFunction key={fn.name} fn={fn} />
        ))}
      </Stack>
    </>
  ) : null;
}
