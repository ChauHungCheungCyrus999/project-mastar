import React from 'react';
import { Box, Link, Typography } from '@mui/material';

import Copyright from './Copyright';

import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: { xs: 4 },
        width: '100%',
        m: '1rem 0',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Link variant="body2" color="text.secondary" href="/privacy-policy">
          {t('privacyPolicy')}
        </Link>

        <Typography display="inline" sx={{ mx: 0.5, opacity: 0.5 }}>
          &nbsp;•&nbsp;
        </Typography>

        <Link
          variant="body2"
          color="text.secondary"
          sx={{ mx: 0.5 }}
          href="#"
        >
          {t('termsOfService')}
        </Link>
      </Box>
      <Box>
        <Copyright />
      </Box>
    </Box>
  );
};

export default Footer;