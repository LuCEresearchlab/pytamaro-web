import { red } from '@mui/material/colors';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

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
declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    neutral: true;
  }
}
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}

// Create a theme instance.
const theme = responsiveFontSizes(createTheme({
  palette: {
    primary: {
      main: '#008BCB',
    },
    secondary: {
      main: '#E1F5FD',
    },
    error: {
      main: red.A400,
    },
  },
  pytamaro: {
    monospaceFontFamily: "'Fira Code Variable', monospace",
    redColor: '#D2071D',
  },
  typography: {
    fontFamily: "'Fira Sans', sans-serif",
  },
}), { factor: 1.5 });

export default theme;
