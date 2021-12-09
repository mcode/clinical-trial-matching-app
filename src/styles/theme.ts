import { createTheme, lighten } from '@mui/material/styles';
import { createBreakpoints } from '@mui/system';

declare module '@mui/material/styles/createPalette' {
  type CustomCommonColors = typeof colors;
  interface CommonColors extends CustomCommonColors {}
}

const colors = {
  blue: '#64a3bf',
  blueDarker: '#4887a4',
  blueLighter: '#84c9e8',
  gray: '#404952',
  grayLight: '#697481',
  grayLighter: '#f6f6f6',
  red: '#9d646c',
  white: '#ffffff',
  yellow: '#bf9b4f',
  green: '#659b78',
};

const breakpoints = createBreakpoints({
  values: {
    xs: 0,
    sm: 480,
    md: 768,
    lg: 992,
    xl: 1400,
  },
});

const theme = createTheme({
  breakpoints,
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '.MuiInputBase-adornedStart': {
            paddingBottom: '5px',
            paddingTop: '28px',
          },
        },
      },
    },
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
    MuiButton: {
      variants: [
        {
          props: { variant: 'contained' },
          style: {
            borderRadius: '0',
            color: colors.white,
            height: '50px',
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: { display: 'flex', flexDirection: 'row', height: 'unset' },
        label: {
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          textOverflow: 'clip',
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
      [breakpoints.down('sm')]: {
        fontSize: '1.2rem',
      },
    },
    subtitle2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
    body1: {
      overflowWrap: 'anywhere',
    },
  },
});

export default theme;
