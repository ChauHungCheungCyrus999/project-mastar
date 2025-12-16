import React from 'react';
import { useMediaQuery, Container, Card, CardContent, Typography, Avatar, Grid } from '@mui/material';
import { styled } from '@mui/system';

import { useTranslation } from 'react-i18next';

const CardContainer = styled('div')({
  position: 'relative',
  '&:hover .StyledCard': {
    transform: "rotate(3deg) scale(1.05)",
  },
  '&:hover .BackgroundCard': {
    transform: "rotate(-3deg)",
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  transition: "transform 0.3s",
  backgroundColor: '#AFD8F5',
  zIndex: 2,
}));

const BackgroundCard = styled(Card)(({ theme }) => ({
  position: 'absolute',
  //top: '10px',
  //left: '10px',
  width: '100%',
  height: '100%',
  backgroundColor: '#9DC4F5',
  zIndex: 1,
  transition: "transform 0.3s",
}));

const TestimonialsSection = () => {
  const { t } = useTranslation();

  const isTablet = useMediaQuery('(max-width:900px)');

  const testimonials = [...Array(4).keys()].map((testimonial, index) => ({
    name: t(`testimonialCard.${index}.name`),
    title: t(`testimonialCard.${index}.title`),
    text: t(`testimonialCard.${index}.text`),
    avatar: t(`testimonialCard.${index}.avatar`),
  }));

  return (
    <Container>
      <Grid container spacing={4} justifyContent="center" sx={{ minHeight: '100%', py: isTablet ? '3rem' : '5rem' }}>
        <Grid item xs={12} sx={{ zIndex: 10, pt: '2rem' }}>
          <Typography variant="h4" align="center" color="primary.main" gutterBottom>
            {t('testimonials')}
          </Typography>
          <Typography variant="body1" align="center" color="primary.dark" sx={{ marginBottom: '2rem' }}>
            {t('testimonialsSubtitle')}
          </Typography>
        </Grid>

        {testimonials.map((testimonial, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <CardContainer>
              <BackgroundCard className="BackgroundCard" />
              <StyledCard className="StyledCard">
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar src={testimonial.avatar} />
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" component="div" color="primary.dark">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="primary.light">
                        {testimonial.title}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body1" mt={2} color="primary.main">
                    {testimonial.text}
                  </Typography>
                </CardContent>
              </StyledCard>
            </CardContainer>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TestimonialsSection;