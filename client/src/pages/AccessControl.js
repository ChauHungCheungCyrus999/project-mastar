import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Home, LockOutlined, Group, Key, AdminPanelSettings } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import RoleManagement from '../components/access-control/RoleManagement';
import PermissionManagement from '../components/access-control/PermissionManagement';
import GrantPermissions from '../components/access-control/GrantPermissions';

import { useTranslation } from 'react-i18next';

const AccessControl = () => {
  const { t } = useTranslation();
  
  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'accessControl', icon: <LockOutlined sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <MainContent pageTitle="accessControl" breadcrumbItems={breadcrumbItems}>
      <Tabs value={currentTab} onChange={handleTabChange} aria-label={t('accessControl')}>
        <Tab label={t("roleManagement")} icon={<Group />} />
        <Tab label={t("permissionManagement")} icon={<Key />} />
        <Tab label={t("grantPermissions")} icon={<AdminPanelSettings />} />
      </Tabs>
      <Box sx={{ py:1 }}>
        {currentTab === 0 && <RoleManagement />}
        {currentTab === 1 && <PermissionManagement />}
        {currentTab === 2 && <GrantPermissions />}
      </Box>
    </MainContent>
  );
};

export default AccessControl;