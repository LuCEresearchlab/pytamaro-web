import {
  Box, Stack,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import theme from '../../src/theme';
import RapidActions from './RapidActions';

export const SIDEBAR_CHIPS_WIDTH = '15em';
export const SIDEBAR_CHIPS_FONT_SIZE = theme.typography.pxToRem(13);

export default function Sidebar({ side, children = null } : { side: 'left' | 'right', children?: React.ReactNode }) {
  return (
    <Grid
      lg={2}
      sx={{
        display: {
          xs: 'none', sm: 'none', md: 'none', lg: 'block',
        },
      }}
    >
      <Box
        sx={{
          top: theme.spacing(10),
          position: 'sticky',
          marginTop: theme.spacing(2),
          paddingLeft: theme.spacing(1.5),
          paddingTop: theme.spacing(1),
          paddingRight: theme.spacing(1.5),
          display: 'block',
          float: side,
        }}
      >
        <Stack direction="column" spacing={4}>
          {side === 'left' && <RapidActions />}
          {children}
        </Stack>
      </Box>
    </Grid>
  );
}
