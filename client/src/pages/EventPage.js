import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Grid, Typography, Button } from '@mui/material';
import { Home, Event } from '@mui/icons-material';

import MainContent from '../components/MainContent';
import EventDialog from '../components/event/EventDialog';
import ErrorPage from './ErrorPage';

import { useTranslation } from 'react-i18next';

import CssBaseline from '@mui/material/CssBaseline';

const EventPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'event', icon: <Event sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  const { projectId, eventId } = useParams();

  const [project, setProject] = useState(null);
  const [event, setEvent] = useState(null);

  // Fetch project and event details on load
  useEffect(() => {
    fetchProject();
    fetchEvent();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/event/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  // Update event handler
  const handleSaveEvent = async (updatedEvent) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/event/${updatedEvent._id}`, updatedEvent);
      setEvent(response.data);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  // Close the EventDialog and navigate back
  const handleCloseDialog = (event, reason) => {
    if (reason && reason === 'backdropClick') return;
    navigate(`/project/${projectId}/calendar`);
  };

  return (
    <div>
      <CssBaseline />

      {project && (
        <MainContent pageTitle={project.title} breadcrumbItems={breadcrumbItems}>
          {event ? (
            <EventDialog
              projectId={projectId}
              open={true}
              onClose={handleCloseDialog}
              onSubmit={handleSaveEvent}
              initialData={event}
              mode="update"
            />
          ) : (
            <ErrorPage title={t('eventNotFound')} body={t('eventNotFoundDesc')} />
          )}
        </MainContent>
      )}
    </div>
  );
};

export default EventPage;