import {
  Box,
  Button,
  ButtonGroup,
  Container, FormControlLabel, Link, Paper, Stack, Switch, Typography,
} from '@mui/material';
import Head from 'next/head';
import NextLink from 'next/link';
import NavigationBar from '../components/NavigationBar';

export default function MyData() {
  return (
    <div>
      <Head>
        <title>My Data - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar title="My Data" />
        <Container maxWidth="md">
          <Typography variant="h3" align="center" marginY={3}>My Data</Typography>
          <Typography variant="body1" marginY={3}>
            Your data is stored in your browser&apos;s local storage.
            On this page you can see what is stored there,
            and you can import and export all your data if you wish.
            You also can configure your privacy settings,
            which influence what data gets sent to our server.
          </Typography>
          <Typography variant="h4" align="center" marginY={3}>Privacy Settings</Typography>
          <Typography variant="body1" marginY={3}>
            PyTamaro Web is run by
            {' '}
            <Link href="https://luce.si.usi.ch/">Luce</Link>
            , the computing education research group at USI in Lugano, Switzerland.
            We run PyTamaro Web on servers at USI.
            We can do this because our job is to conduct research on how people (like you)
            learn to program.
            We are not a company, and we do not sell your data to anyone.
            However, for our research, we need to understand the kind of programs learners write,
            and which learning trajectories they take through the activities.
            This is why we would like to place cookies in your browser.
          </Typography>
          <Paper sx={{ padding: '2rem' }}>
            <Typography variant="h5" marginBottom={3}>
              Cookie Permissions
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="success">Allow Luce Cookies</Button>
              <Button variant="contained" color="error">Disallow Luce Cookies</Button>
            </Stack>
            <Typography variant="body1" marginTop={3}>
              Please select whether you allow us to store our cookies in your browser.
            </Typography>
          </Paper>
          <Typography variant="body1" marginY={3}>
            Even if you allow our cookies,
            we do not collect any personally-identifiable data.
            You remain completely anonymous.
            We will not know who you are, we will not know where you are.
            We describe this fully in our
            {' '}
            <Link component={NextLink} href="/privacy">Privacy Policy</Link>
            .
          </Typography>
          <Typography variant="h4" align="center" marginY={3}>Export and Import</Typography>
          <Typography variant="body1" marginY={3}>
            The data (e.g., source code) you enter in PyTamaro Web is stored in your browser,
            inside its local storage.
            You may want to export the data into a file
            you can carry around (e.g., if you work at home and in school),
            you can backup (e.g., if someone might clear your browser&apos;s local storage),
            or you can send to your teacher.
          </Typography>
          <Typography variant="body1" marginY={3}>
            TODO
          </Typography>
          <Typography variant="h4" align="center" marginY={3}>My Source Code</Typography>
          <Typography variant="body1" marginY={3}>
            You wrote source code for the following activities:
          </Typography>
          <Typography variant="body1" marginY={3}>
            TODO
          </Typography>
        </Container>
      </Box>
    </div>
  );
}
