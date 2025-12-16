import React from 'react';
import { useMediaQuery, Link } from '@mui/material';

const Logo = ({ theme, displayIcon=true, style={} }) => {
  const isMobile = useMediaQuery('(max-width:600px)');

  const getLogoSrc = () => {
    if (displayIcon) {
      return isMobile ? `/logo-mobile-${theme}.png` : `/logo-${theme}.png`;
    } else {
      return isMobile ? `/logo-mobile-${theme}.png` : `/logo-${theme}-without-icon.png`;
    }
  };

  return (
    <Link href="/" underline="none">
      <img
        src={getLogoSrc()}
        style={{ 
          maxHeight: isMobile ? '30px' : '50px', 
          maxWidth: '200px', 
          verticalAlign: 'middle',
          ...style // Spread the custom styles here
        }}
        alt="Logo"
      />
    </Link>
  );
};

export default Logo;
