import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

declare module '@mui/material/styles' {
  interface Theme {
    pytamaro: {
      monospaceFontFamily: string;
      redColor: string,
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    pytamaro?: {
      monospaceFontFamily?: string;
      redColor?: string,
    };
  }

  interface Palette {
    neutral: Palette['primary'];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/CircularProgress' {
  interface CircularProgressPropsColorOverrides {
    neutral: true;
  }
}
declare module '@mui/material/ToggleButton' {
  interface ToggleButtonPropsColorOverrides {
    neutral: true;
  }
}

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    neutral: {
      main: '#fff',
    },
  },
  pytamaro: {
    monospaceFontFamily: 'Fira Code, monospace',
    redColor: '#D2071D',
  },
});

export default theme;
