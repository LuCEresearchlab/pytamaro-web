import {
  AppBar, Box, Button, Toolbar, Typography,
} from '@mui/material';

const navItems = [
  {
    name: 'Home',
    url: '/',
  },
  {
    name: 'Learning Modules',
    url: '/modules',
  },
];

export default function NavigationBar(props: { title: string }) {
  const { title } = props;
  return (
    <Box>
      <AppBar component="nav">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            {title}
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item.url} href={item.url} sx={{ color: '#fff' }}>
                {item.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Box>
  );
}
