import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Home, SettingsOutlined, BadgeOutlined, SecurityOutlined, CloudSyncOutlined } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import UpdateUserProfile from '../components/account-settings/UpdateUserProfile';
import Security from '../components/account-settings/Security';
import SyncProfile from '../components/account-settings/SyncProfile';

import { useTranslation } from 'react-i18next';

const AccountSettings = () => {
  const { t } = useTranslation();
  
  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'accountSettings', icon: <SettingsOutlined sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <MainContent pageTitle="accountSettings" breadcrumbItems={breadcrumbItems}>
      <Tabs value={currentTab} onChange={handleTabChange} aria-label={t('accountSettings')}>
        <Tab label={t("updateUserProfile")} icon={<BadgeOutlined />} />
        <Tab label={t("security")} icon={<SecurityOutlined />} />
        <Tab label={t("syncProfile")} icon={<CloudSyncOutlined />} />
      </Tabs>
      <Box sx={{ py: 1 }}>
        {currentTab === 0 && <UpdateUserProfile />}
        {currentTab === 1 && <Security />}
        {currentTab === 2 && <SyncProfile />}
      </Box>
    </MainContent>
  );
};

export default AccountSettings;