import { createTheme } from '@material-ui/core/styles';

declare module '@material-ui/core/styles/createPalette' {
  type CustomCommonColors = typeof colors;
  interface CommonColors extends CustomCommonColors {}
}

const breakpoints = {
  values: {
    xs: 0,
    sm: 480,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1440,
  },
};

const colors = {
  blue: '#65A3BF',
  red: '#9D646D',
  gray: '#414952',
  grayLighter: '#F6F6F6',
};

const typography = {
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
};

const palette = {
  primary: {
    main: colors.blue,
  },
  secondary: {
    main: colors.red,
  },
  error: {
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
};

const theme = createTheme({
  breakpoints,
  palette,
  typography,
});

export default theme;
