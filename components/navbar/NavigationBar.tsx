import {
  AccountTree,
  Code,
  PlayCircle,
  PlayLesson,
  Route,
} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  ListItemButton,
  ListItemIcon,
  Paper,
  Stack,
  Toolbar,
} from '@mui/material';
import React, { useState, type ReactNode } from 'react';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import theme from '../../src/theme';
import {
  aboutPathname,
  activitiesByAuthorPathname,
  curriculaPathname,
  documentationPathname,
  evaluatorPathname,
  idePathname,
  myProgressPathname,
  playgroundPathname,
} from '../../src/urlUtils';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import ToolboxListSidebar from '../sidebar/ToolboxListSidebar';
import FeedbackButton from './FeedbackButton';
import NotificationsButton from './NotificationsButton';
import RapidEvaluatorButton from './RapidEvaluatorButton';
import SettingsButton from './SettingsButton';

type NavItem = {
  name: string;
  url?: string;
  children?: { name: string; url: string; icon: ReactNode }[];
};

const navItems: NavItem[] = [
  {
    name: 'learn',
    children: [
      {
        name: 'activities',
        url: activitiesByAuthorPathname('luce'),
        icon: <PlayLesson />,
      },
      { name: 'curricula', url: curriculaPathname(), icon: <Route /> },
    ],
  },
  {
    name: 'program',
    children: [
      { name: 'evaluator', url: evaluatorPathname(), icon: <Code /> },
      {
        name: 'playground',
        url: playgroundPathname(),
        icon: <PlayCircle />,
      },
      { name: 'ide', url: idePathname(), icon: <AccountTree /> },
    ],
  },
  {
    name: 'my-progress',
    url: myProgressPathname(),
  },
  {
    name: 'documentation',
    url: documentationPathname(),
  },
  {
    name: 'about',
    url: aboutPathname(),
  },
];

function NavPopoverButton({ item }: { item: NavItem }) {
  const { t } = useLocalTranslation();
  return (
    <Popover placement='bottom-start'>
      <PopoverTrigger>
        <Button
          style={{ textTransform: 'none' }}
          sx={{ color: theme.palette.text.primary }}
        >
          {t(item.name)}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Paper sx={{ paddingY: 0.5, minWidth: 160 }}>
          <Stack>
            {(item.children || []).map((child) => {
              return (
                <ListItemButton component='a' key={child.url} href={child.url}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {child.icon}
                  </ListItemIcon>
                  {t(child.name)}
                </ListItemButton>
              );
            })}
          </Stack>
        </Paper>
      </PopoverContent>
    </Popover>
  );
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
          marginTop: '-0.25rem', // vertically align the logotype to the baseline of the text in the navbar
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
    <AppBar
      id='app-bar'
      position='sticky'
      elevation={0}
      sx={{
        background: theme.pytamaro.palette.background.default,
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
            slotProps={{
              paper: {
                style: {
                  backgroundColor: theme.pytamaro.palette.background.default,
                },
              },
            }}
          >
            <Box
              sx={{
                m: 1,
              }}
            >
              <Stack direction='column'>
                <PyTamaroHomeLogo />
                {navItems.flatMap((item) =>
                  (item.children ?? [item]).map((link) => (
                    <ListItemButton
                      component='a'
                      key={link.url}
                      href={link.url}
                      sx={{ px: 0.5 }}
                    >
                      {t(link.name)}
                    </ListItemButton>
                  )),
                )}
              </Stack>
              <Divider sx={{ m: 1 }} />
              <ToolboxListSidebar skipPopup />
            </Box>
          </Drawer>
        </Box>

        <Stack
          direction='row'
          divider={<Divider flexItem orientation='vertical' variant='middle' />}
          useFlexGap
          spacing={1}
          sx={{
            display: {
              lg: 'flex',
              xs: 'none',
            },

            flexGrow: 1,
          }}
        >
          <PyTamaroHomeLogo />
          {navItems.map((item) =>
            item.children !== undefined ? (
              <NavPopoverButton key={item.name} item={item} />
            ) : (
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
            ),
          )}
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
              <RapidEvaluatorButton />
              <FeedbackButton />
              <NotificationsButton />
              <SettingsButton />
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
