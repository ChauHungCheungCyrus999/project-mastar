import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import { Home, Folder, Settings, FlagOutlined, LocalOfferOutlined } from '@mui/icons-material';
import axios from 'axios';

import MainContent from '../components/MainContent';
import MilestoneSetup from '../components/project-settings/MilestoneSetup';
import TagManagement from '../components/project-settings/TagManagement';

import { useTranslation } from 'react-i18next';

const ProjectSettings = () => {
  const { t } = useTranslation();

  const { projectId } = useParams();
  const [project, setProject] = useState();

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: project?.title, icon: <Folder sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'projectSettings', icon: <Settings sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <MainContent pageTitle="projectSettings" breadcrumbItems={breadcrumbItems}>
      <Tabs value={currentTab} onChange={handleTabChange} aria-label={t('accountSettings')}>
        <Tab label={t("milestoneSetup")} icon={<FlagOutlined />} />
        <Tab label={t("tagManagement")} icon={<LocalOfferOutlined />} />
      </Tabs>
      <Box sx={{ py: 1 }}>
        {currentTab === 0 && <MilestoneSetup />}
        {currentTab === 1 && <TagManagement />}
      </Box>
    </MainContent>
  );
};

export default ProjectSettings;