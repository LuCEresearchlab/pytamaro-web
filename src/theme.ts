import { red } from '@mui/material/colors';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    pytamaro: {
      monospaceFontFamily: string;
      monospaceFontSize: number;
      redColor: string;
      backgroundColor: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    pytamaro?: {
      monospaceFontFamily?: string;
      monospaceFontSize?: number;
      redColor?: string;
      backgroundColor?: string;
    };
  }
}

const theme = responsiveFontSizes(
  createTheme({
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
      monospaceFontSize: 0.95 * 16,
      redColor: '#D2071D',
      backgroundColor: '#E1F5FD',
    },
    typography: {
      fontFamily: "'Fira Sans', sans-serif",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (themeParam) => `
          code, pre {
            font-size: ${themeParam.pytamaro.monospaceFontSize}px;
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
