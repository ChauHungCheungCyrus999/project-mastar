import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Home, HelpOutline, BookOutlined, VideocamOutlined, QuestionAnswerOutlined } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import UserManual from '../components/help/UserManual';
import VideoTutorial from '../components/help/VideoTutorial';
import HelpFaq from '../components/help/HelpFaq';

import { useTranslation } from 'react-i18next';

const Help = () => {
  const { t } = useTranslation();
  
  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'help', icon: <HelpOutline sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <MainContent pageTitle="help" breadcrumbItems={breadcrumbItems}>
      <Tabs value={currentTab} onChange={handleTabChange} aria-label={t('help')}>
        <Tab label={t("userManual")} icon={<BookOutlined />} />
        <Tab label={t("videoTutorial")} icon={<VideocamOutlined />} />
        <Tab label={t("faq")} icon={<QuestionAnswerOutlined />} />
      </Tabs>
      <Box sx={{ py: 1 }}>
        {currentTab === 0 && <UserManual />}
        {currentTab === 1 && <VideoTutorial />}
        {currentTab === 2 && <HelpFaq />}
      </Box>
    </MainContent>
  );
};

export default Help;