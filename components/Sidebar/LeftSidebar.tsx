import { MenuBook } from '@mui/icons-material';
import {
  Box, Link, Stack,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import theme from '../../src/theme';
import { pytamaroDocsUrl } from '../../src/urlUtils';
import SidebarPlayground from './SidebarPlayground';
import SidebarTitle from './SidebarTitle';

export const SIDEBAR_CHIPS_WIDTH = '15em';
export const SIDEBAR_CHIPS_FONT_SIZE = theme.typography.pxToRem(13);

export default function LeftSidebar({ children } : { children: React.ReactNode }) {
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
          top: theme.spacing(8),
          position: 'sticky',
          paddingLeft: theme.spacing(1.5),
          paddingTop: theme.spacing(1),
          paddingRight: theme.spacing(2),
          display: 'block',
          float: 'left',
        }}
      >
        <SidebarTitle>
          At my fingertips
        </SidebarTitle>
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
        {children}
      </Box>
    </Grid>
  );
}
