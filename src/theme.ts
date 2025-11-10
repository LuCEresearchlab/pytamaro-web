import { red } from '@mui/material/colors';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    pytamaro: {
      monospaceFontFamily: string;
      monospaceFontSizeRatio: number;
      redColor: string;
      errorBackgroundRed: string;
      backgroundColor: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    pytamaro?: {
      monospaceFontFamily?: string;
      monospaceFontSizeRatio: number;
      redColor?: string;
      errorBackgroundRed?: string;
      backgroundColor?: string;
    };
  }
}

const theme = responsiveFontSizes(
  createTheme({
    cssVariables: true,
    palette: {
      primary: {
        main: '#008BCB',
      },
      secondary: {
        main: '#19857B',
      },
      error: {
        main: red.A400,
      },
    },
    pytamaro: {
      monospaceFontFamily: "'Fira Code Variable', monospace",
      monospaceFontSizeRatio: 0.9625,
      redColor: '#D2071D',
      errorBackgroundRed: 'rgba(255, 245, 245)',
      backgroundColor: '#E1F5FD',
    },
    typography: {
      fontFamily: "'Fira Sans', sans-serif",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (themeParam) => `
          code, pre {
            font-size: ${themeParam.pytamaro.monospaceFontSizeRatio}em;
            font-family: ${themeParam.pytamaro.monospaceFontFamily};
            font-variant-ligatures: none;
          }
        `,
      },
    },
  }),
  { factor: 1.5 },
);

export default theme;
