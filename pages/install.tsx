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
        <NavigationBar />
        <Container maxWidth="md">
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
          <Typography variant="h3" align="center" marginY={3}>Frequently Asked Questions</Typography>
          <Typography variant="h6">
            I was using PyTamaro and now some functions do not work anymore as they used to!
          </Typography>
          <Typography variant="body1">
            In February 2023, we released a new version of PyTamaro
            that includes some breaking changes to the API
            to improve the consistency of the library and its error messages.
            <br />
            We advise to upgrade to the latest version of PyTamaro
            (
            <code>pip install --upgrade pytamaro</code>
            ).
            <br />
            The documentation for the older version of PyTamaro (years 2022 and before)
            {' '}
            <a href="https://pytamaro.readthedocs.io/en/version_2022/">is still available</a>
            .
            <br />
            For a detailed list of the changes, see
            {' '}
            <a href="https://github.com/LuCEresearchlab/pytamaro/blob/main/CHANGELOG.md#040---2023-02-27">this changelog</a>
            .
          </Typography>
        </Container>
      </Box>
    </div>
  );
}
