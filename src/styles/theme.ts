import { createTheme, lighten } from '@mui/material/styles';

declare module '@mui/material/styles/createPalette' {
  type CustomCommonColors = typeof colors;
  interface CommonColors extends CustomCommonColors {}
}

const colors = {
  blue: '#64a3bf',
  blueLighter: '#84c9e8',
  gray: '#404952',
  grayLight: '#697481',
  grayLighter: '#f6f6f6',
  red: '#9d646c',
  white: '#ffffff',
  yellow: '#bf9b4f',
  green: '#659b78',
};

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 480,
      md: 768,
      lg: 992,
      xl: 1300,
    },
  },
  components: {
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.white,
          '&:hover': {
            backgroundColor: lighten(colors.blue, 0.9),
          },
        },
      },
    },
  },
  palette: {
    primary: {
      main: colors.blue,
    },
    secondary: {
      main: colors.red,
    },
    common: colors,
    background: {
      default: colors.grayLighter,
    },
    text: {
      primary: colors.gray,
      secondary: colors.gray,
    },
    grey: {
      800: colors.gray,
    },
  },
  typography: {
    fontFamily: [
      'Open Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ].join(','),
    fontWeightMedium: 600,
    h6: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
});

export default theme;
