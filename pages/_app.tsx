import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ConfirmProvider } from 'material-ui-confirm';
import PlausibleProvider from 'next-plausible';
import Box from '@mui/material/Box';
import theme from '../src/theme';
import createEmotionCache from '../src/createEmotionCache';
import '../style/styles.css';
import PageFooter from '../components/PageFooter';

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
            <Box sx={{
              display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'flex-start',
            }}
            >
              <Component // eslint-disable-next-line react/jsx-props-no-spreading
                {...pageProps}
              />
              <PageFooter />
            </Box>
          </ConfirmProvider>
        </PlausibleProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
