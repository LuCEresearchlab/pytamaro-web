/* eslint-disable react/jsx-one-expression-per-line */
import {
  Box,
  Container, Link, Typography,
} from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/NavigationBar';
import { translationProps } from '../src/serverSideTranslationProps';
import theme from '../src/theme';
import { activityVariantPathnameFromParts } from '../src/urlUtils';

const PYTHON_VERSION = '3.13';
const PYTAMARO_VERSION = '1.0.2';

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
            <pre style={{ textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.dark }}>pip install pytamaro</pre>
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
            Which environment is used to execute my Python code?
          </QuestionHeading>
          <QuestionBody>
            We execute your code in an enviroment with <a href={`https://docs.python.org/3/whatsnew/${PYTHON_VERSION}.html`}>{`Python ${PYTHON_VERSION}`}</a> and <code>pytamaro</code> version <a href={`https://pypi.org/project/pytamaro/${PYTAMARO_VERSION}/`}><code>{PYTAMARO_VERSION}</code></a>.
            For the text in your graphics, you can use these fonts:
            <ul>
              {['Fira Sans',
                'Fira Code',
                'Roboto',
                'Roboto Condensed',
                'Roboto Serif',
                'Roboto Mono',
                'IBM Plex Sans',
                'IBM Plex Serif',
                'IBM Plex Mono',
                'PT Sans',
                'PT Serif',
                'PT Mono',
                'Ubuntu',
                'Ubuntu Mono',
                'Inter',
                'Cormorant Garamond',
                'Libre Bodoni',
                'Jost'].map((font) => <li key={font}><a href={`https://fonts.google.com/specimen/${font}`}>{font}</a></li>)}
            </ul>
            <Link href={activityVariantPathnameFromParts('luce', 'available-fonts', 'en', 'v2')}>This activity</Link> features examples in Python that make use of the available fonts.
          </QuestionBody>

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

        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...await translationProps(),
    },
  };
}
