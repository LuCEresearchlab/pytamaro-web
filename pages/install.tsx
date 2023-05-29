/* eslint-disable react/jsx-one-expression-per-line */
import {
  Box,
  Container, Typography,
} from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/NavigationBar';

function SectionHeading({ children } : { children: React.ReactNode }) {
  return (
    <Typography variant="h3" mt={6} align="center">
      {children}
    </Typography>
  );
}

function QuestionHeading({ children } : { children: React.ReactNode }) {
  return (
    <Typography variant="h6" mt={4}>
      {children}
    </Typography>
  );
}

function QuestionBody({ children } : { children: React.ReactNode }) {
  return (
    <Typography variant="body1" component="div">
      {children}
    </Typography>
  );
}

export default function Install() {
  return (
    <div>
      <Head>
        <title>Installation Guide - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <SectionHeading>How to Install PyTamaro</SectionHeading>

          <QuestionHeading>
            If you know how to use <code>pip</code>
          </QuestionHeading>
          <QuestionBody>
            If you have installed on your computer a Python interpreter
            with the <code>pip</code> package manager, you can easily install PyTamaro:
            <pre style={{ textAlign: 'center', color: 'red' }}>pip install pytamaro</pre>
          </QuestionBody>

          <QuestionHeading>
            If you use Thonny as an IDE
          </QuestionHeading>
          <QuestionBody>
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
          </QuestionBody>

          <SectionHeading>Frequently Asked Questions</SectionHeading>

          <QuestionHeading>
            I was using PyTamaro and now some functions do not work anymore as they used to!
          </QuestionHeading>
          <QuestionBody>
            In February 2023, we released a new version of PyTamaro
            that includes some breaking changes to the API
            to improve the consistency of the library and its error messages.
            <br />
            We advise to upgrade to the latest version of PyTamaro
            (
            <code>pip install --upgrade pytamaro</code>
            ).
            <br />
            The documentation for the older version of PyTamaro (years 2022 and before) <a href="https://pytamaro.readthedocs.io/en/version_2022/">is still available</a>.
            <br />
            For a detailed list of the changes, see <a href="https://github.com/LuCEresearchlab/pytamaro/blob/main/CHANGELOG.md#040---2023-02-27">this changelog</a>.
          </QuestionBody>

          <QuestionHeading>
            Which environment is used to execute my Python code?
          </QuestionHeading>
          <QuestionBody>
            We execute your code in an enviroment with <a href="https://docs.python.org/3/whatsnew/3.11.html">Python 3.11</a> and the following libraries:
            <ul>
              <li>
                <code>pytamaro</code> version <a href="https://pypi.org/project/pytamaro/0.5.0/"><code>0.5.0</code></a>
              </li>
              <li>
                <code>friendly</code> version <a href="https://github.com/friendly-traceback/friendly"><code>fe5d3a2</code></a>
                {' '}(configured to show user-friendly tracebacks)
              </li>
            </ul>
          </QuestionBody>
        </Container>
      </Box>
    </div>
  );
}
