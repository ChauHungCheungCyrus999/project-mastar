import React from 'react';
import { useMediaQuery, Container, Card, CardContent, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';

import { useTranslation } from 'react-i18next';

const CardContainer = styled('div')({
  position: 'relative',
  '&:hover .StyledCard': {
    transform: 'rotate(2deg) scale(1.05)',
    backgroundColor: '#141A22',
    color: 'white',
  },
  '&:hover .BackgroundCard': {
    transform: 'rotate(-2deg)',
  },
});

const BackgroundCard = styled('div')({
  backgroundColor: '#9DC4F5',
  borderRadius: '8px',
  padding: '20px',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  transform: 'rotate(2deg)',
  transition: 'transform 0.3s ease-in-out',
  zIndex: -1,
});

const StyledCard = styled(Card)({
  position: 'relative',
  color: 'text.primary',
  backgroundColor: '#AFD8F5',
  transition: 'transform 0.3s ease-in-out',
  zIndex: 2,
});

const CallToActionSection = () => {
  const { t } = useTranslation();
  
  const isTablet = useMediaQuery('(max-width:900px)');

  const handleAction = () => {
    window.location.href = '/register';
  };

  return (
    <Container sx={{ minHeight: '100%', position: 'relative', padding: '40px', pt: isTablet? '30%':'5rem' }}>
      <CardContainer>
        <BackgroundCard className="BackgroundCard" />
        <StyledCard className="StyledCard">
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              {t('callToActionTitle')}
            </Typography>
            <Typography variant="body2">
              {t('callToActionSubtitle')}
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleAction}>
              {t('signUp')}
            </Button>
          </CardContent>
        </StyledCard>
      </CardContainer>
    </Container>
  );
};

export default CallToActionSection;