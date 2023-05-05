import {
  AppBar, Button, Divider, Stack, Toolbar,
} from '@mui/material';
import FeedbackDialog from './FeedbackDialog';
import { activitiesByAuthorPathname } from '../src/urlUtils';

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
    name: 'My Data',
    url: '/my-data',
  },
  {
    name: 'Docs',
    url: 'https://pytamaro.readthedocs.org',
  },
];

// eslint-disable-next-line react/require-default-props
export default function NavigationBar(props: { children?: React.ReactNode }) {
  const { children } = props;
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexGrow: 1 }}
          divider={<Divider light orientation="vertical" flexItem />}
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
