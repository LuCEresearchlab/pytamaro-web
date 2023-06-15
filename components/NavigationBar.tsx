import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar, Box, Button, Divider, IconButton, Menu, MenuItem, Stack, Toolbar,
} from '@mui/material';
import { useState } from 'react';
import { activitiesByAuthorPathname, curriculaPathname, myProgressPathname } from '../src/urlUtils';
import FeedbackDialog from './FeedbackDialog';

const navItems = [
  {
    name: 'Home',
    url: '/',
  },
  {
    name: 'Activities',
    url: activitiesByAuthorPathname('luce'),
  },
  {
    name: 'Curricula',
    url: curriculaPathname(),
  },
  {
    name: 'My Progress',
    url: myProgressPathname(),
  },
  {
    name: 'About',
    url: '/about',
  },
];

// eslint-disable-next-line react/require-default-props
export default function NavigationBar(props: { children?: React.ReactNode }) {
  const { children } = props;
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="Menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
          >
            {navItems.map((item) => (
              <MenuItem key={item.url} component="a" href={item.url}>
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexGrow: 1 }}
          divider={<Divider light orientation="vertical" flexItem />}
          display={{ xs: 'none', md: 'flex' }}
        >
          {navItems.map((item) => (
            <Button key={item.url} href={item.url} sx={{ color: '#fff' }}>
              {item.name}
            </Button>
          ))}
        </Stack>
        {children}
        <FeedbackDialog />
      </Toolbar>
    </AppBar>
  );
}
