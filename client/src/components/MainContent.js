import React, { useContext, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { CssBaseline, useMediaQuery, Box } from '@mui/material';

import UserContext from '../UserContext';

import Breadcrumb from './Breadcrumb';
import PageHeader from './PageHeader';

import { useTranslation } from 'react-i18next';

const MainContent = ({ pageTitle, breadcrumbItems, actions, children }) => {
  const theme = useTheme();

  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const { t } = useTranslation();

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    document.title = t('appName') + ' - ' + t(pageTitle);
    return () => {
      document.title = t('appName') + ' - ' + t(pageTitle);
    };
  }, []);

  return (
    <Box style={{ backgroundColor: theme.palette.background.default }}>
      <CssBaseline />

      <Breadcrumb items={breadcrumbItems} />
      
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <PageHeader title={t(pageTitle)} />
        { actions }
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginBottom: isMobile? '3.5rem':'0'
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainContent;