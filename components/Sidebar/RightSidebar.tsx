import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import theme from '../../src/theme';

export default function RightSidebar({ children } : { children: React.ReactNode }) {
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
          paddingTop: theme.spacing(1),
          paddingRight: theme.spacing(2),
          display: 'block',
          float: 'right',
        }}
      >
        {children}
      </Box>
    </Grid>
  );
}
