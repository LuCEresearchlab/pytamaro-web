import {
  Box,
  Container, Typography,
} from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/NavigationBar';

export default function Install() {
  return (
    <div>
      <Head>
        <title>Installation Guide - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar title="Installation Guide" />
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" marginY={3}>How to Install PyTamaro</Typography>
          <Typography variant="h6">
            If you know how to use
            {' '}
            <code>pip</code>
          </Typography>
          <Typography variant="body1">
            If you have installed on your computer a Python interpreter
            with the
            {' '}
            <code>pip</code>
            {' '}
            package manager, you can easily install PyTamaro:
            <br />
            <code>pip install pytamaro</code>
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            If you use Thonny as an IDE
          </Typography>
          <Typography component="span" variant="body1">
            <ol>
              <li>
                Select the &quot;Tools&quot; menu,
                then choose &quot;Manage packages&quot;
              </li>
              <li>
                Type &quot;pytamaro&quot; in the search field
                and click the &quot;Search on PyPI&quot; button
              </li>
              <li>
                Select &quot;PyTamaro&quot; in the search results,
                then click the &quot;Install&quot; button.
              </li>
            </ol>
          </Typography>
        </Container>
      </Box>
    </div>
  );
}
