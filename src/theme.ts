import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f6feb',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  shape: {
    borderRadius: 10,
  },
});
