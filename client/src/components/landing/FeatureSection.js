// FeatureSection.js
import React from "react";
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Paper, Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";

import { useTranslation } from 'react-i18next';

const Root = styled(Box)({
  padding: '64px 0', // Equivalent to theme.spacing(8, 0)
});

/*const Title = styled(Typography)({
  marginBottom: '32px', // Equivalent to theme.spacing(4)
  fontWeight: "bold",
  color: "black"
});*/

const StyledPaper = styled(Paper)({
  height: '250px',
  padding: '32px', // Equivalent to theme.spacing(4)
  textAlign: "center",
  borderRadius: '4px', // Use a fixed border-radius instead of theme.shape.borderRadius
  cursor: "pointer",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-10px)",
    //boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)', // Use a fixed box-shadow instead of theme.shadows[4]
  },
});

const Icon = styled(Typography)({
  fontSize: '40px',
  marginBottom: '16px', // Equivalent to theme.spacing(2)
  color: '#3f51b5', // Use a fixed color instead of theme.palette.primary.main
});

const FadeIn = styled(Grid)(({ delay }) => ({
  opacity: 0,
  transform: "translateY(20px)",
  animation: `fadeInAnimation 0.5s forwards`,
  animationDelay: `${delay}s`,
  "@keyframes fadeInAnimation": {
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const FeatureSection = () => {
  const theme = useTheme();

  const { t } = useTranslation();

  const features = [...Array(8).keys()].map((feature, index) => ({
    title: t(`featureCard.${index}.title`),
    description: t(`featureCard.${index}.description`),
    icon: t(`featureCard.${index}.icon`),
  }));

  const handleAction = () => {
    window.location.href = '/register';
  };

  return (
    <Root sx={{ minHeight: '100%' }}>
      <Container>
        <Typography variant="h4" align="center" color="primary.contrastText" gutterBottom>
          {t('featuresTitle')}
        </Typography>
        <Typography variant="body1" align="center" sx={{ color: theme.palette.grey[400], marginBottom: '2rem' }}>
          {t('featuresSubtitle')}
        </Typography>
        
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <FadeIn item xs={12} sm={6} md={3} key={index} delay={index * 0.2}>
              <StyledPaper elevation={2}>
                <Icon variant="h4">
                  {feature.icon}
                </Icon>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2">{feature.description}</Typography>
              </StyledPaper>
            </FadeIn>
          ))}
        </Grid>

        <Grid container justifyContent="center" my={4} gap={2}>
          <Button
            variant="contained"
            onClick={handleAction}
          >
            {t('getStarted')}
          </Button>
          <Button
            variant="outlined"
            style={{ color: theme.palette.grey[300], borderColor: theme.palette.grey[300] }}
          >
            {t('learnMore')}
          </Button>
        </Grid>
      </Container>
    </Root>
  );
};

export default FeatureSection;