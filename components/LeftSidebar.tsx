import { Code, MenuBook } from '@mui/icons-material';
import {
  Box, Link, Popover, Stack, Typography, styled,
} from '@mui/material';
import { useState } from 'react';
import { ToolboxFunction } from '../src/localStorage/schema';
import useLocalToolbox from '../src/localStorage/useLocalToolbox';
import theme from '../src/theme';
import { pytamaroDocsUrl } from '../src/urlUtils';
import RapidPlayground from './RapidPlayground';
import { emptySingleCell } from './SolitaryCodeCell';
import ToolboxFunctionSummary from './ToolboxFunctionSummary';

const Title = styled(Typography)(() => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  fontSize: theme.typography.pxToRem(11),
  fontWeight: theme.typography.fontWeightBold,
  textTransform: 'uppercase',
  letterSpacing: '.08rem',
  color: theme.palette.grey[600],
}));

function SidebarToolboxFunction({ fn }: { fn: ToolboxFunction }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Typography
        width="fit-content"
        key={fn.name}
        fontSize={theme.typography.pxToRem(13)}
        fontFamily={theme.pytamaro.monospaceFontFamily}
        variant="body2"
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        sx={{ cursor: 'pointer' }}
      >
        {fn.name}
      </Typography>
      <Popover
        id="mouse-over-popover"
        sx={{
          marginLeft: 1,
          pointerEvents: 'none',
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
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <ToolboxFunctionSummary fn={fn} showSource={false} />
      </Popover>
    </>
  );
}

function SidebarPlayground() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const initialCodeCells = emptySingleCell();
  const [codeCells, setCodeCells] = useState(initialCodeCells);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Typography
        width="fit-content"
        variant="body2"
        aria-owns={open ? 'popover' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ cursor: 'pointer' }}
        display="flex"
        color="primary"
      >
        <Code fontSize="small" sx={{ mr: '.7ch' }} />
        Rapid Playground
      </Typography>
      <Popover
        id="popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            minWidth: '80ch',
          },
        }}
      >
        <RapidPlayground
          initialCodeCells={initialCodeCells}
          codeCells={codeCells}
          setCodeCells={setCodeCells}
        />
      </Popover>
    </>
  );
}

export default function LeftSidebar() {
  const { list } = useLocalToolbox();
  const toolboxFunctions = list();
  return (
    <Box
      sx={{
        top: theme.spacing(8),
        position: 'sticky',
        paddingLeft: theme.spacing(1.5),
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(2),
        display: 'block',
        float: 'left',
      }}
    >
      <Title>
        At my fingertips
      </Title>
      <Stack spacing={1} mb={4}>
        <SidebarPlayground />
        <Link
          variant="body2"
          underline="none"
          href={pytamaroDocsUrl()}
          display="flex"
          target="_blank"
        >
          <MenuBook fontSize="small" sx={{ mr: '.7ch' }} />
          Documentation
        </Link>
      </Stack>
      {toolboxFunctions.length > 0 && (
        <>
          <Title>
            My Toolbox
          </Title>
          <Stack
            spacing={1}
          >
            {toolboxFunctions.map((fn) => (
              <SidebarToolboxFunction key={fn.name} fn={fn} />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
