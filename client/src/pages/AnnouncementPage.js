import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Grid, Typography, Button } from '@mui/material';
import { Home, Announcement as AnnouncementIcon } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import AnnouncementDialog from '../components/AnnouncementDialog';
import ErrorPage from './ErrorPage';

import { useTranslation } from 'react-i18next';

import CssBaseline from '@mui/material/CssBaseline';

const AnnouncementPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'announcement', icon: <AnnouncementIcon sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const { projectId, announcementId } = useParams();

  const [project, setProject] = useState(null);
  const [announcement, setAnnouncement] = useState(null);

  // Fetch project and announcement details on load
  useEffect(() => {
    fetchProject();
    fetchAnnouncement();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/announcement/${announcementId}`);
      setAnnouncement(response.data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
    }
  };

  // Close the AnnouncementDialog and navigate back
  const handleCloseDialog = () => {
    navigate(`/project/${projectId}/dashboard`);
  };

  return (
    <div>
      <CssBaseline />

      {project && (
        <MainContent pageTitle={project.title} breadcrumbItems={breadcrumbItems}>
          {announcement ? (
            <AnnouncementDialog
              open={true}
              onClose={handleCloseDialog}
              announcement={announcement}
            />
          ) : (
            <ErrorPage title={t('announcementNotFound')} body={t('announcementNotFoundDesc')} />
          )}
        </MainContent>
      )}
    </div>
  );
};

export default AnnouncementPage;