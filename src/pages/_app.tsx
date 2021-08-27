import React, { ReactElement } from 'react';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';

import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import '@fontsource/open-sans/800.css';

import Header from '@/components/Header';
import emotionCache from '@/emotionCache';
import theme from '@/styles/theme';

import type { AppProps } from 'next/app';

const App = ({ Component, pageProps }: AppProps): ReactElement => (
  <CacheProvider value={emotionCache}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header user={pageProps.user} />
      <Component {...pageProps} />
    </ThemeProvider>
  </CacheProvider>
);

export default App;
