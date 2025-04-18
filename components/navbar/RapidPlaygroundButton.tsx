import Code from '@mui/icons-material/Code';
import { IconButton, Paper, Tooltip } from '@mui/material';
import { useState } from 'react';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import RapidPlayground from '../RapidPlayground';
import { emptySingleCell } from '../SolitaryCodeCell';

export default function RapidPlaygroundButton() {
  const { t } = useLocalTranslation(['common']);
  const initialCodeCells = emptySingleCell();
  const [codeCells, setCodeCells] = useState(initialCodeCells);

  return (
    <Popover placement='bottom'>
      <PopoverTrigger>
        <Tooltip arrow title={t('rapidPlayground')}>
          <span>
            <IconButton sx={{ color: theme.palette.text.primary }}>
              <Code />
            </IconButton>
          </span>
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent>
        <Paper sx={{ minWidth: '80ch', maxWidth: '100ch' }} elevation={0}>
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
