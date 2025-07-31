import { Box } from '@mui/material';
import { AppCacheProvider } from '@mui/material-nextjs/v15-pagesRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmProvider } from 'material-ui-confirm';
import { appWithTranslation } from 'next-i18next';
import PlausibleProvider from 'next-plausible';
import { AppProps } from 'next/app';
import Head from 'next/head';
import PageFooter from '../components/PageFooter';
import theme from '../src/theme';
import '../style/styles.css';

// Fonts
import '@fontsource-variable/fira-code';
import '@fontsource/fira-sans/300.css';
import '@fontsource/fira-sans/400.css';
import '@fontsource/fira-sans/500.css';
import '@fontsource/fira-sans/700.css';
// Icon font
import '@fontsource/material-icons';

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  const queryClient = new QueryClient();
  return (
    <AppCacheProvider {...props}>
      <Head>
        <title>PyTamaro</title>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                justifyContent: 'flex-start',
              }}
            >
              <QueryClientProvider client={queryClient}>
                <Component // eslint-disable-next-line react/jsx-props-no-spreading
                  {...pageProps}
                />
                <PageFooter />
              </QueryClientProvider>
            </Box>
          </ConfirmProvider>
        </PlausibleProvider>
      </ThemeProvider>
    </AppCacheProvider>
  );
}

export default appWithTranslation(MyApp);
