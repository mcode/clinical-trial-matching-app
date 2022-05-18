import { createTheme, lighten, responsiveFontSizes } from '@mui/material/styles';
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
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&.borderless': {
            boxShadow: 'none',
            '&::before': { backgroundColor: 'unset' },
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: { margin: 0, flexDirection: 'row', minHeight: 'unset' },
        content: { overflowWrap: 'break-word' },
      },
    },
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
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.blue,
        },
      },
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
    MuiDrawer: {
      styleOverrides: {
        root: {
          '.MuiDrawer-paper': { boxSizing: 'border-box' },
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
    MuiRadio: {
      styleOverrides: {
        root: {
          color: colors.blue,
        },
      },
    },
    MuiTableCell: {
      variants: [
        {
          props: { variant: 'head' },
          style: {
            textTransform: 'uppercase',
            [breakpoints.between('xs', 'xl')]: { textAlign: 'left', zIndex: 'auto' },
            [breakpoints.up('xl')]: { textAlign: 'right', flex: 1 },
            verticalAlign: 'top',
          },
        },
        {
          props: { variant: 'body' },
          style: {
            whiteSpace: 'pre-line',
            [breakpoints.up('xl')]: { flex: 7 },
          },
        },
      ],
    },
    MuiTablePagination: {
      styleOverrides: {
        spacer: { flex: 'none' },
        toolbar: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          [breakpoints.between('xs', 'lg')]: { justifyContent: 'center', padding: 0 },
          [breakpoints.up('lg')]: { justifyContent: 'flex-end' },
        },
        selectLabel: {
          display: 'flex',
          [breakpoints.between('xs', 'md')]: { marginLeft: 0 },
          [breakpoints.up('md')]: { marginLeft: '36px' },
        },
        input: { display: 'flex' },
        displayedRows: {
          display: 'flex',
          [breakpoints.between('xs', 'md')]: { marginRight: 0 },
          [breakpoints.up('md')]: { marginRight: '36px' },
        },
        actions: { display: 'flex' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          display: 'flex',
          [breakpoints.between('xs', 'xl')]: {
            flexDirection: 'column',
            '& td': { border: 0 },
          },
          [breakpoints.up('xl')]: {
            flexDirection: 'row',
            '& td': { borderBottom: '1px solid rgba(224, 224, 224, 1)' },
            '&:last-child td, &:last-child th': { border: 0 },
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
    body1: {
      overflowWrap: 'anywhere',
    },
  },
});

const themeWithResponsiveFontSizes = responsiveFontSizes(theme);

export default themeWithResponsiveFontSizes;
