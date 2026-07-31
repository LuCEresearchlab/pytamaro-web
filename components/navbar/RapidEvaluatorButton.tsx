import Code from '@mui/icons-material/Code';
import { IconButton, Paper, Tooltip } from '@mui/material';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import RapidEvaluator from '../RapidEvaluator';

export default function RapidEvaluatorButton() {
  const { t } = useLocalTranslation(['common']);

  return (
    <Popover placement='bottom'>
      <PopoverTrigger>
        <Tooltip arrow title={t('rapidEvaluator')}>
          <div>
            <IconButton sx={{ color: theme.palette.text.primary }}>
              <Code />
            </IconButton>
          </div>
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent>
        <Paper
          sx={{ minWidth: '80ch', maxWidth: '100ch', marginRight: 2 }}
          elevation={0}
        >
          <RapidEvaluator />
        </Paper>
      </PopoverContent>
    </Popover>
  );
}
