import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  Toolbar,
  useScrollTrigger,
} from '@mui/material';
import React, { cloneElement, useEffect, useState } from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import theme from '../src/theme';
import {
  aboutPathname,
  activitiesByAuthorPathname,
  curriculaPathname,
  myProgressPathname,
} from '../src/urlUtils';
import FeedbackDialog from './FeedbackDialog';
import NotificationsButton from './NotificationsButton';
import PlatformLanguageButton from './PlatformLanguageButton';
import ToolboxListSidebar from './sidebar/ToolboxListSidebar';

const navItems = [
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

function ScrollAppBarChanges({
  enabled = false,
  children,
}: {
  enabled: boolean;
  children: React.ReactElement;
}) {
  const [scrollThreshold, setScrollThreshold] = useState(100);

  useEffect(() => {
    const element = document.getElementById('homepage-landscape');
    const elementAppBar = document.getElementById('app-bar');
    setScrollThreshold(
      element && elementAppBar
        ? element.offsetTop + element.offsetHeight - elementAppBar.offsetHeight
        : 100,
    );
  }, []);

  const scrolled = useScrollTrigger({
    disableHysteresis: true,
    threshold: scrollThreshold,
  });

  if (!enabled) {
    return children;
  }

  return cloneElement(children, {
    sx: {
      background: scrolled ? theme.palette.secondary.main : '#ffffff80',
    },
  });
}

function PyTamaroHomeLogo() {
  return (
    <IconButton
      href='/'
      style={{
        borderRadius: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt='PyTamaro'
        src='/logo-navbar.png'
        style={{
          height: '1.3rem',
        }}
      />
    </IconButton>
  );
}

export default function NavigationBar({
  home = false,
  children = null,
}: {
  home?: boolean;
  children?: React.ReactNode;
}) {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const { t } = useLocalTranslation();

  return (
    <ScrollAppBarChanges enabled={home === true}>
      <AppBar
        id='app-bar'
        position='sticky'
        elevation={0}
        sx={{
          background: theme.palette.secondary.main,
        }}
      >
        <Toolbar>
          <Box
            sx={{
              flexGrow: 1,
              display: {
                lg: 'none',
                xs: 'flex',
              },
            }}
          >
            <IconButton
              aria-controls='menu-appbar'
              aria-haspopup='true'
              aria-label='Menu'
              onClick={handleOpenNavMenu}
              size='large'
              sx={{
                color: theme.palette.text.primary,
              }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor='left'
              onClose={handleCloseNavMenu}
              open={Boolean(anchorElNav)}
              sx={{
                display: { xs: 'block', lg: 'none' },
              }}
              PaperProps={{
                style: {
                  backgroundColor: theme.palette.secondary.main,
                },
              }}
            >
              <Box m={1}>
                <Stack direction='column'>
                  <PyTamaroHomeLogo />
                  {navItems.map((item) => (
                    <MenuItem component='a' key={item.url} href={item.url}>
                      {t(item.name)}
                    </MenuItem>
                  ))}
                </Stack>
                <Divider sx={{ m: 1 }} />
                <ToolboxListSidebar skipPopup />
              </Box>
            </Drawer>
          </Box>

          <Stack
            direction='row'
            display={{
              lg: 'flex',
              xs: 'none',
            }}
            divider={
              <Divider flexItem orientation='vertical' variant='middle' />
            }
            useFlexGap
            spacing={1}
            sx={{
              flexGrow: 1,
            }}
          >
            <PyTamaroHomeLogo />
            {navItems.map((item) => (
              <Button
                href={item.url}
                key={item.url}
                style={{
                  textTransform: 'none',
                }}
                sx={{
                  color: theme.palette.text.primary,
                }}
              >
                {t(item.name)}
              </Button>
            ))}
          </Stack>

          <Stack
            direction='row'
            spacing={1}
            sx={{
              marginLeft: 'auto',
            }}
          >
            {children}
            {!home && (
              <>
                <FeedbackDialog />
                <NotificationsButton />
                <PlatformLanguageButton />
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </ScrollAppBarChanges>
  );
}
