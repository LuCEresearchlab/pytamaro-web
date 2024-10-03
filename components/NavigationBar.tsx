import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar, Box, Button, Divider, Drawer, IconButton,
  MenuItem, Stack, Toolbar,
} from '@mui/material';
import { useState } from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  aboutPathname,
  activitiesByAuthorPathname, curriculaPathname, documentationPathname, myProgressPathname,
  playgroundPathname, pytamaroDocsUrl,
} from '../src/urlUtils';
import FeedbackDialog from './FeedbackDialog';
import NotificationsButton from './NotificationsButton';
import PlatformLanguageButton from './PlatformLanguageButton';
import SidebarItem from './sidebar/SidebarItem';
import ToolboxListSidebar from './sidebar/ToolboxListSidebar';

const navItems = [
  {
    name: 'home',
    url: '/',
  },
  {
    name: 'activities',
    url: activitiesByAuthorPathname('luce'),
  },
  {
    name: 'curricula',
    url: curriculaPathname(),
  },
  {
    name: 'my-progress',
    url: myProgressPathname(),
  },
  {
    name: 'about',
    url: aboutPathname(),
  },
];

const smallScreensNavItems = [
  ...navItems,
  {
    name: 'PyTamaro ReadTheDocs',
    url: pytamaroDocsUrl(),
  },
  {
    name: 'documentation',
    url: documentationPathname(),
  },
  {
    name: 'playground',
    url: playgroundPathname(),
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

  const { t } = useLocalTranslation();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', lg: 'none' } }}>
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
          <Drawer
            anchor="left"
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: 'block', lg: 'none' },
            }}
          >
            <Box m={1}>
              <SidebarItem title="Menu">
                <Stack direction="column">
                  {smallScreensNavItems.map((item) => (
                    <MenuItem key={item.url} component="a" href={item.url}>
                      {t(item.name)}
                    </MenuItem>
                  ))}
                </Stack>
              </SidebarItem>
              <Divider sx={{ m: 1 }} />
              <ToolboxListSidebar skipPopup />
            </Box>
          </Drawer>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexGrow: 1 }}
          divider={<Divider light orientation="vertical" flexItem />}
          display={{ xs: 'none', lg: 'flex' }}
        >
          {navItems.map((item) => (
            <Button key={item.url} href={item.url} sx={{ color: '#fff' }}>
              {t(item.name)}
            </Button>
          ))}
        </Stack>
        {children}
        <FeedbackDialog />
        <NotificationsButton />
        <PlatformLanguageButton />
      </Toolbar>
    </AppBar>
  );
}
