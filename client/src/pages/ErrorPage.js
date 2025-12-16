import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';

// Define the ErrorPage component
const ErrorPage = ({ title, body }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Handle button click to navigate home
  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '80vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: '6rem', color: theme.palette.primary.main }} />
        <Typography sx={{ marginTop: '16px', fontSize: '2.5rem', color: '#666' }} variant="h1" component="h2">
          {title}
        </Typography>
        <Typography sx={{ marginTop: '8px', fontSize: '1.2rem', color: '#999', textAlign: 'center' }} variant="body1">
          {body}
        </Typography>
        <Button
          sx={{
            marginTop: '32px',
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            '&:hover': {
              backgroundColor: '#e65b50',
            },
          }}
          variant="contained"
          onClick={handleHomeClick}
        >
          {t('goToHome')}
        </Button>
      </Box>
    </ThemeProvider>
  );
};

// Export the ErrorPage component
export default ErrorPage;
