import React, { useEffect } from 'react';
import { CssBaseline, Container, Grid, Box, Typography } from '@mui/material';

import Navbar from "../components/landing/Navbar";
import Footer from "../components/Footer";

import { useTranslation } from 'react-i18next';

const PrivacyPolicy = ({ mode, setMode, setTheme }) => {
  const { t } = useTranslation();

  // Update page title
  useEffect(() => {
    document.title = t('appName') + ' - ' + t('privacyPolicy'); // Set the new page title
    return () => {
      document.title = t('appName') + ' - ' + t('privacyPolicy'); // Reset the page title when the component unmounts
    };
  }, []);

  return (
    <>
      <CssBaseline />

      <Navbar displayMenu={false} />

      <Container maxWidth="lg" className="main-container">
        <Grid container spacing={3} sx={{ m: '0 1rem', py: { xs: 8, sm: 16 } }}>
          <Box>
            <Box style={{ margin: 'auto', padding: '16px' }}>
              <Typography variant="h1" component="h1" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '2rem' }}>
                {t('privacyPolicy')}
              </Typography>
              <Typography variant="body1" style={{ marginBottom: '2rem' }}>
                {t('privacyPolicyDesc')}
              </Typography>

              <Box style={{ display: 'flex', flexDirection: 'column' }}>
                <Box style={{ marginBottom: '2rem' }}>
                  <Typography variant="h2" component="h2" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {t('informationCollect')}
                  </Typography>
                  <Typography variant="body1">
                    {t('informationCollectDesc')}
                  </Typography>
                  <ul>
                    {t('collectInfoList', { returnObjects: true }).map((item, index) => (
                      <li key={index}>
                        <Typography variant="body1">
                          {item}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>

                <Box style={{ marginBottom: '2rem' }}>
                  <Typography variant="h2" component="h2" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {t('howWeUseInfo')}
                  </Typography>
                  <Typography variant="body1">
                    {t('howWeUseInfoDesc')}
                  </Typography>
                  <ul>
                    {t('useInfoList', { returnObjects: true }).map((item, index) => (
                      <li key={index}>
                        <Typography variant="body1">
                          {item}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>

                <Box style={{ marginBottom: '2rem' }}>
                  <Typography variant="h2" component="h2" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {t('security')}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '1rem' }}>
                    {t('securityInfo')}
                  </Typography>
                </Box>

                <Box style={{ marginBottom: '2rem' }}>
                  <Typography variant="h2" component="h2" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {t('cookies')}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '1rem' }}>
                    {t('cookiesInfo.0')}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '1rem' }}>
                    {t('cookiesInfo.1')}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '1rem' }}>
                    {t('cookiesInfo.2')}
                  </Typography>
                </Box>

                <Box style={{ marginBottom: '2rem' }}>
                  <Typography variant="h2" component="h2" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {t('linksToOtherWebsites')}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '1rem' }}>
                    {t('linksToOtherWebsitesInfo')}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h2" component="h2" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {t('controllingPersonalInfo')}
                  </Typography>
                  <Typography variant="body1">
                    {t('controllingPersonalInfoDesc')}
                  </Typography>
                  <ul>
                    {t('controllingPersonalInfoList', { returnObjects: true }).map((item, index) => (
                      <li key={index}>
                        <Typography variant="body1">
                          {item}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>

                <Typography variant="body1">
                  {t('privacyPolicySubjectToChange')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Container>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;