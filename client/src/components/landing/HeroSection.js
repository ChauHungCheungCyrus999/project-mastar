import React from 'react';
import { useMediaQuery, Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/system';

import { useTranslation } from 'react-i18next';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const typing = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

const blink = keyframes`
  50% {
    border-color: transparent;
  }
`;

const gradientAnimation = keyframes`
  0% {
    background-position: 0;
  }
  to {
    background-position: 100%;
  }
`;

const Background = styled(Box)({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  color: 'white',
});

const Content = styled(Box)({
  position: 'relative',
  zIndex: 2,
  maxWidth: '100%',
  maxHeight: '50%',
  textAlign: 'center',
});

const Logo = styled('img')({
  width: '100px',
  marginBottom: '20px',
  animation: `${rotate} 10s linear infinite`,
});

const AnimatedTitle = styled(Typography)({
  animation: `${fadeIn} 2s ease-out`,
  margin: '1rem',
  backgroundImage: 'linear-gradient(45deg, #ffb3ba, #c49c6e, #bfbf76, #77b084, #ff7e74, #3b82f6, #c084fc, #db2777)',
  color: 'transparent',
  WebkitBackgroundClip: 'text', /* Edge, Chrome */
  backgroundClip: 'text', /* Safari, FF */
  animation: `${gradientAnimation} 8s linear infinite alternate`,
  backgroundSize: '300% 100%',
});

const TypingSubtitle = styled(Typography)({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  borderRight: '3px solid white',
  width: '100%',
  margin: '1rem',
  animation: `${typing} 4s steps(40, end), ${blink} 0.75s step-end infinite`,
});

const VideoBackground = styled('video')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: 1,
  pointerEvents: 'none',
  filter: 'brightness(50%)'
});

const HeroSection = () => {
  const { t } = useTranslation();

  const isTablet = useMediaQuery('(max-width:900px)');

  return (
    <Background>
      <VideoBackground src="/static/landing/hero-section-bg.mp4" autoPlay muted loop />
      <Content>
        <Logo src="/logo-mobile-light.png" alt="Logo" />
        <AnimatedTitle variant={isTablet ? 'h4' : 'h3'} gutterBottom>
          {t('landingTitle')}
        </AnimatedTitle>
        {isTablet ? (
          <Typography variant="subtitle1" gutterBottom>
            {t('landingSubTitle')}
          </Typography>
        ) : (
          <TypingSubtitle variant="h5">
            {t('landingSubTitle')}
          </TypingSubtitle>
        )}
      </Content>
    </Background>
  );
};

export default HeroSection;
