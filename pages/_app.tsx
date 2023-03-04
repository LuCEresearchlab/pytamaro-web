import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ConfirmProvider } from 'material-ui-confirm';
import PlausibleProvider from 'next-plausible';
import { Container, Divider, Typography } from '@mui/material';
import theme from '../src/theme';
import createEmotionCache from '../src/createEmotionCache';
import '../style/styles.css';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  // eslint-disable-next-line react/require-default-props
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>PyTamaro</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <PlausibleProvider
          domain={process.env.NEXT_PUBLIC_DOMAIN as string}
          customDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_URL}
          selfHosted
        >
          <ConfirmProvider>
            <Component // eslint-disable-next-line react/jsx-props-no-spreading
              {...pageProps}
            />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 2 }}>
              <Divider>
                <Typography variant="body2" align="center">
                  PyTamaro is a project created by
                  the&nbsp;
                  <a href="https://luce.si.usi.ch/">Lugano Computing Education Research Lab</a>
            &nbsp;at the&nbsp;
                  <a href="https://si.usi.ch/">Software Institute</a>
            &nbsp;of&nbsp;
                  <a href="https://www.usi.ch/">USI</a>
                </Typography>
              </Divider>
            </Container>
          </ConfirmProvider>
        </PlausibleProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
