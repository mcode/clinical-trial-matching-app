import emotionCache from '@/emotionCache';
import theme from '@/styles/theme';
import { CacheProvider } from '@emotion/react';
import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import '@fontsource/open-sans/800.css';
import { CircularProgress, CssBaseline, Stack, ThemeProvider, Typography } from '@mui/material';
import type { AppProps } from 'next/app';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { DehydratedState, Hydrate } from 'react-query/hydration';

const App = ({ Component, pageProps, router }: AppProps<{ dehydratedState: DehydratedState }>): ReactElement => {
  const [loading, setLoading] = useState(false);
  const handleStart = useCallback(() => setLoading(true), []);
  const handleStop = useCallback(() => setLoading(false), []);

  useEffect(() => {
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [handleStop, handleStart, router.events]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {loading ? (
              <Stack minHeight="100vh" maxHeight="100vh" justifyContent="center" alignItems="center">
                <CircularProgress size="10vh" />
                <Typography variant="h4" marginTop={3}>
                  Loading page...
                </Typography>
              </Stack>
            ) : (
              <Component {...pageProps} />
            )}
            <ReactQueryDevtools initialIsOpen={false} />
          </ThemeProvider>
        </CacheProvider>
      </Hydrate>
    </QueryClientProvider>
  );
};

export default App;
