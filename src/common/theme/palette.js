import { grey } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? grey[900] : grey[50],
  },
  primary: {
    main:  darkMode ? '#01BC51' : '#01BC51',
  },
  secondary: {
    main:  darkMode ? '#01BC51' : '#01BC51',
  },
  neutral: {
    main: darkMode ? grey[500] : grey[50],
  },
  geometry: {
    main:  darkMode ? '#3bb2d0' : '#3bb2d0',
  },
});
