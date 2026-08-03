import { grey } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

// Trailblazer brand green, used as the default when the server has no override.
const brandColor = '#01BC51';

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? grey[900] : grey[50],
  },
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || brandColor,
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || brandColor,
  },
  neutral: {
    main: darkMode ? grey[500] : grey[50],
  },
  geometry: {
    main: '#3bb2d0',
  },
  alwaysDark: {
    main: grey[900],
  },
});
