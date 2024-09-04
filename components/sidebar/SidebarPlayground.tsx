import { Code } from '@mui/icons-material';
import {
  Paper, Typography,
} from '@mui/material';
import { useState } from 'react';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import RapidPlayground from '../RapidPlayground';
import { emptySingleCell } from '../SolitaryCodeCell';

export default function SidebarPlayground() {
  const { t } = useLocalTranslation(['common']);
  const initialCodeCells = emptySingleCell();
  const [codeCells, setCodeCells] = useState(initialCodeCells);

  return (
    <Popover placement="right">
      <PopoverTrigger>
        <Typography
          width="fit-content"
          variant="body2"
          sx={{ cursor: 'pointer' }}
          display="flex"
          color="primary"
        >
          <Code fontSize="small" sx={{ mr: '.7ch' }} />
          {t('rapidPlayground')}
        </Typography>
      </PopoverTrigger>
      <PopoverContent>
        <Paper sx={{ minWidth: '80ch' }} elevation={0}>
          <RapidPlayground
            initialCodeCells={initialCodeCells}
            codeCells={codeCells}
            setCodeCells={setCodeCells}
          />
        </Paper>
      </PopoverContent>
    </Popover>
  );
}
