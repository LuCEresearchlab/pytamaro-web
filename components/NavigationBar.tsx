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
import React, { cloneElement, useState } from 'react';
import useLocalTranslation from '../src/localStorage/useLocalTranslation';
import {
  activitiesByAuthorPathname,
  curriculaPathname,
  documentationPathname,
  myProgressPathname,
} from '../src/urlUtils';
import SidebarItem from './sidebar/SidebarItem';
import ToolboxListSidebar from './sidebar/ToolboxListSidebar';
import FeedbackDialog from './FeedbackDialog';
import NotificationsButton from './NotificationsButton';
import PlatformLanguageButton from './PlatformLanguageButton';
import theme from '../src/theme';

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
    name: 'documentation',
    url: documentationPathname(),
  },
];

function ScrollAppBarChanges(props: {
  enabled: boolean,
  children?: React.ReactElement,
}) {
  const {
    enabled,
    children,
  } = props;

  // Hooks needs to be called in the exact same order in every
  // component render, so we can't move this inside the if.
  // Reference: eslint:react-hooks/rules-of-hooks
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  if (!children) {
    return null;
  }

  if (!enabled) {
    return children;
  }

  return cloneElement(children, {
    sx: {
      background: trigger
        ? '#fff'
        : 'linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.5) 100%);',
    },
    variant: trigger ? 'outlined' : 'elevation',
  });
}

// eslint-disable-next-line react/require-default-props
export default function NavigationBar(props: {
  home?: boolean,
  children?: React.ReactNode,
}) {
  const {
    home,
    children,
  } = props;

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
        position='sticky'
        elevation={0}
        sx={{
          background: '#fff',
        }}
      >
        <Toolbar>
          <Box sx={{
            flexGrow: 1,
            display: {
              lg: 'none',
              xs: 'flex',
            }
          }}>
            <IconButton
              aria-controls='menu-appbar'
              aria-haspopup='true'
              aria-label='Menu'
              onClick={handleOpenNavMenu}
              size='large'
              sx={{
                color: theme.palette.text.primary
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
            >
              <Box m={1}>
                <SidebarItem title='PyTamaro'>
                  <Stack direction='column'>
                    {navItems.map((item) => (
                      <MenuItem
                        component='a'
                        key={item.url}
                        href={item.url}
                      >
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
            direction='row'
            display={{
              lg: 'flex',
              xs: 'none',
            }}
            divider={
              <Divider
                flexItem
                orientation='vertical' />
            }
            spacing={1}
            sx={{
              flexGrow: 1,
            }}
          >
            <IconButton
              disableRipple
              href='/'
              sx={{
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <img
                alt='PyTamaro'
                src='/PyTamaro-horizontal.png'
                style={{
                  height: '3rem',
                  minHeight: '1rem',
                }} />
            </IconButton>

            {navItems.map((item) => (
              <Button
                href={item.url}
                key={item.url}
                style={{
                  textTransform: 'none'
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
              flexGrow: 1
            }}
            style={{
              position: 'absolute',
              right: '1rem',
            }}
          >

            {home || <FeedbackDialog />}
            {home || <NotificationsButton />}
            {home || <PlatformLanguageButton />}
            {children}
          </Stack>
        </Toolbar>
      </AppBar>
    </ScrollAppBarChanges>
  );
}
