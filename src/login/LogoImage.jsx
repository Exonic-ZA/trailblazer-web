import React, { useEffect, useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import Logo from '../resources/images/logo.svg?react';
import DarkModeLogo from '../resources/images/logo-darkmode.svg?react';


const useStyles = makeStyles((theme) => ({
  image: {
    alignSelf: 'center',
    maxWidth: '240px',
    maxHeight: '120px',
    width: 'auto',
    height: 'auto',
    margin: theme.spacing(2),
  },
}));

const LogoImage = ({ color, backgroundColor }) => {
  const theme = useTheme();
  const classes = useStyles();
  const [isDarkBackground, setIsDarkBackground] = useState(false);

  const expanded = !useMediaQuery(theme.breakpoints.down('lg'));

  const logo = useSelector((state) => state.session.server.attributes?.logo);
  const logoInverted = useSelector((state) => state.session.server.attributes?.logoInverted);

  useEffect(() => {
    if (backgroundColor) {
      const rgb = backgroundColor.match(/\d+/g);
      const brightness = Math.round(((parseInt(rgb[0]) * 299) +
                                    (parseInt(rgb[1]) * 587) +
                                    (parseInt(rgb[2]) * 114)) / 1000);
      setIsDarkBackground(brightness < 128);
    }
  }, [backgroundColor]);

  if (logo) {
    if (expanded && logoInverted) {
      return <img className={classes.image} src={logoInverted} alt="" />;
    }
    return <img className={classes.image} src={logo} alt="" />;
  }
  return isDarkBackground ? (
    <DarkModeLogo className={classes.image} style={{ color }} />
  ) : (
    <Logo className={classes.image} style={{ color }}/>
  );
};

export default LogoImage;