import { Code } from '@mui/icons-material';
import { Popover, Typography } from '@mui/material';
import { useState } from 'react';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import RapidPlayground from '../RapidPlayground';
import { emptySingleCell } from '../SolitaryCodeCell';

export default function SidebarPlayground() {
  const { t } = useLocalTranslation(['common']);
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
        {t('rapidPlayground')}
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
