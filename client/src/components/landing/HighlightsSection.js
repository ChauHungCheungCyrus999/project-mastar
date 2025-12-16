import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Container, Grid, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Parallax } from 'react-scroll-parallax';

import { useTranslation } from 'react-i18next';

const HighlightsSection = () => {
  const theme = useTheme();
  
  const { t } = useTranslation();

  const isTablet = useMediaQuery('(max-width:900px)');

  const highlights = [...Array(4).keys()].map((highlight, index) => ({
    title: t(`highlightCard.${index}.title`),
    description: t(`highlightCard.${index}.description`),
  }));

  const handleAction = () => {
    window.location.href = '/register';
  };

  return (
    <Container>
      <Grid container sx={{ position: 'relative', minHeight: '100%', pt: isTablet? '3rem':'5rem' }}>
        <Grid item xs={12} sm={6} sx={{ py:5, zIndex: 10 }}>
          <Typography variant="h4" align="left" color="text.white" gutterBottom sx={{ color: theme.palette.grey[200] }}>
            {t('highlightsTitle')}
          </Typography>
          <Typography variant="body1" align="left" color="text.darkWhite" sx={{ color: theme.palette.grey[400], marginBottom: '2rem' }}>
            {t('highlightsSubtitle')}
          </Typography>
          <Button variant="contained" onClick={handleAction}>{t('signUp')}</Button>
        </Grid>

        <Grid item xs={12} sm={6} sx={{ position: 'relative', height: isTablet? '130vh':'120vh', overflow: 'hidden' }}>
          {highlights.map((highlight, index) => (
            <Parallax
              key={index}
              translateY={[`${index * 100}`, `${-index * 100}`]}
              tagOuter="div"
              easing="easeInQuad"
            >
              <Card sx={{
                maxWidth: '500px',
                margin: 'auto',
                marginTop: '0.5rem',
                marginBottom: '2rem',
                backgroundColor: index % 2 === 0 ? '#e0f7fa' : '#9DC4F5',
                transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                zIndex: 4 - index,
              }}>
                <CardContent>
                  <Typography variant="h5" component="div" color="primary.main">
                    {highlight.title}
                  </Typography>
                  <Typography variant="body2" color="primary.dark">
                    {highlight.description}
                  </Typography>
                </CardContent>
              </Card>
            </Parallax>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
};

export default HighlightsSection;