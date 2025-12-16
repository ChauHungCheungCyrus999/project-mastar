// Reference: https://github.com/mui/material-ui/blob/v5.15.14/docs/data/material/getting-started/templates/landing-page/components/AppAppBar.js
// Demo: https://mui.com/material-ui/getting-started/templates/landing-page/

import React, { useState, useEffect } from 'react';
import { useMediaQuery, CssBaseline, Container, Grid, Typography, Divider } from '@mui/material';
import { ParallaxProvider } from 'react-scroll-parallax';

import Navbar from "../components/landing/Navbar";
import HeroSection from '../components/landing/HeroSection';
import VisualsSection from "../components/landing/VisualsSection";
import HighlightsSection from '../components/landing/HighlightsSection';
import CallToActionSection from '../components/landing/CallToActionSection';
import Hexagon from "../components/shapes/Hexagon";
//import Features from "../components/landing/Features";
import FeatureSection from "../components/landing/FeatureSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import Faq from "../components/landing/Faq";
import Footer from '../components/Footer';

import styles from './LandingPage.module.css';

import { useTranslation } from 'react-i18next';

const LandingPage = ({ mode, setMode, setTheme }) => {
  const { t } = useTranslation();

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    document.title = t('appName');
    return () => {
      document.title = t('appName');
    };
  }, []);

  useEffect(() => {
    document.body.classList.add(styles['landing-page-body']);
  }, []);

  const [hoveredCard, setHoveredCard] = useState(null);

  const handleCardHover = (card) => {
    setHoveredCard(card);
  };

  const getCardDescription = () => {
    // Return the description based on the hovered card
    switch (hoveredCard) {
      case t('schedule'):
        return t('scheduleDescription');
      case t('resource'):
        return t('resourceDescription');
      case t('budget'):
        return t('budgetDescription');
      case t('quality'):
        return t('qualityDescription');
      case t('scope'):
        return t('scopeDescription');
      case t('risk'):
        return t('riskDescription');
      default:
        return t('appDescription');
    }
  };

  return (
    <div>
      <CssBaseline />

      <Navbar displayMenu={true} />
      
      <HeroSection />
      
      <VisualsSection />

      <Grid id="features" sx={{ position: isMobile? 'relative':'sticky', top: 0, height: isMobile? '100%':'100vh', backgroundColor: '#f7f7f7', backgroundImage: 'url(/static/landing/features-section-bg.jpg)', backgroundSize: '100%', backgroundRepeat: 'no-repeat' }}>
        <ParallaxProvider>
          <FeatureSection />
        </ParallaxProvider>
      </Grid>

      <Grid id="highlights" container sx={{ position: 'sticky', top: 0, height: '100%', backgroundColor: '#f7f7f7', backgroundImage: 'url(/static/landing/benefits-section-bg.png)', backgroundSize: '100%', backgroundRepeat: 'no-repeat' }}>
        <ParallaxProvider>
          <HighlightsSection />
        </ParallaxProvider>
      </Grid>

      <Grid id="testimonials" container sx={{ position: 'sticky', top: 0, height: isMobile? '100%':'100vh', backgroundColor: '#f7f7f7' }}>
        <ParallaxProvider>
          <TestimonialsSection />
        </ParallaxProvider>
      </Grid>

      <Grid id="callToAction" container sx={{ position: 'sticky', top: 0, /*height: isMobile? '100%':'100vh',*/ backgroundColor: '#f7f7f7', padding: '1rem' }}>
        <ParallaxProvider>
          <CallToActionSection />
        </ParallaxProvider>
      </Grid>

      {/*<Container maxWidth="lg" className="main-container">
        <Grid container spacing={3} sx={{ py: { xs: 8, sm: 16 } }}>
          <Grid item xs={12} md={6}>
            <Hexagon onCardHover={handleCardHover} />
          </Grid>

          <Grid item xs={12} md={6} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={styles['description-container']} style={{ margin: '0 5rem' }}>
              <Typography component="h2" variant="h4" color="text.primary">
                {hoveredCard || t('appName')}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 2, mb: { xs: 2, sm: 4 } }}
              >
                {hoveredCard ? getCardDescription() : t('appDescription')}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Container>*/}

      <Grid id="faq" container sx={{ position: 'sticky', top: 0, height: '100vh', backgroundColor: '#f7f7f7' }}>
        <Faq />
      </Grid>

      <Grid container sx={{ position: 'absolute' }}>
        <Footer />
      </Grid>
    </div>
  );
};

export default LandingPage;