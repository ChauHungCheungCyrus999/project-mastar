import React from 'react';
import { Home, HelpOutline } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import HelpFaq from '../components/HelpFaq';

const Help = () => {
  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'help', icon: <HelpOutline sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  return (
    <MainContent pageTitle="help" breadcrumbItems={breadcrumbItems}>
      <HelpFaq />
    </MainContent>
  );
};

export default Help;