import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CssBaseline, Box, Typography, Chip, Card, CardContent, Skeleton } from '@mui/material';
import { Home, Campaign } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-hk'; // Importing locale data for Chinese (Hong Kong)

import { displayHtml } from '../utils/RichTextUtils';
import MainContent from '../components/MainContent';
import AnnouncementDialog from '../components/AnnouncementDialog';

import UserContext from '../UserContext';

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

const Announcement = () => {
  const { user } = useContext(UserContext);
  const { t, i18n } = useTranslation();
  const { projectId } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedProject, setSelectedProject] = useState('all');

  // Set dayjs locale based on i18n language
  useEffect(() => {
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'announcement', icon: <Campaign sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  // Fetch announcements
  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchAnnouncements = async () => {
      try {
        setLoading(true); // Ensure loading state is set before the API call
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/announcementsByUser`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && Array.isArray(response.data)) {
          const sortedData = response.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
          setAnnouncements(sortedData);

          if (projectId) {
            setFilteredAnnouncements(sortedData.filter(a => a.project?._id === projectId));
            setSelectedProject(projectId);
          } else {
            setFilteredAnnouncements(sortedData);
            setSelectedProject('all');
          }
        } else {
          console.error('Invalid API response:', response.data);
          setAnnouncements([]);
          setFilteredAnnouncements([]);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        setAnnouncements([]);
        setFilteredAnnouncements([]);
      } finally {
        setLoading(false); // Stop loading after the API call finishes
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/user/${user._id}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      }
    };

    fetchAnnouncements();
    fetchProjects();
  }, [projectId, user._id]);

  // Function to check if the announcement is within the last 30 days
  const isNewAnnouncement = (date) => {
    const now = dayjs();
    return now.diff(dayjs(date), 'day') <= 30;
  };

  // Handle open dialog
  const handleDialogOpen = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDialogOpen(true);
  };

  // Handle close dialog
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  // Handle project filter
  const handleProjectClick = (projectId) => {
    setSelectedProject(projectId);
    if (projectId === 'all') {
      setFilteredAnnouncements(announcements);
    } else {
      setFilteredAnnouncements(announcements.filter(a => a.project?._id === projectId));
    }
  };

  return (
    <MainContent pageTitle="announcement" breadcrumbItems={breadcrumbItems}>
      <CssBaseline />

      <Box sx={{ maxWidth: '1200px', width: '100%', margin: 'auto', p: 2 }}>
        {/* Render project filter chips if no projectId in URL */}
        {!projectId && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label={t('all')}
              onClick={() => handleProjectClick('all')}
              color={selectedProject === 'all' ? 'primary' : 'default'}
              variant={selectedProject === 'all' ? 'filled' : 'outlined'}
              clickable
            />

            {projects.map((project) => (
              <Chip
                key={project._id}
                label={project.title}
                onClick={() => handleProjectClick(project._id)}
                color={selectedProject === project._id ? 'primary' : 'default'}
                variant={selectedProject === project._id ? 'filled' : 'outlined'}
                clickable
              />
            ))}
          </Box>
        )}

        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={118} />
        ) : filteredAnnouncements.length === 0 ? (
          <Typography variant="body1">{t('noAnnouncements')}</Typography>
        ) : (
          filteredAnnouncements.map((announcement, index) => (
            <Card
              variant="outlined"
              key={index}
              sx={{
                mb: 2,
                backgroundColor: 'background.paper',
                cursor: 'pointer',
              }}
              onClick={() => handleDialogOpen(announcement)}
            >
              <CardContent>
                {/* Title Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {announcement.title}
                  </Typography>
                  {isNewAnnouncement(announcement.createdDate) && (
                    <Chip
                      label={t('new')}
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </Box>

                {/* Content Section */}
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 5,
                  }}
                >
                  {displayHtml(announcement.content)}
                </Typography>

                {/* Date Section */}
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                  {dayjs(announcement.createdDate).fromNow()} &bull; {dayjs(announcement.createdDate).format(t('MMMM DD, YYYY [at] hh:mm A'))}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}

        <AnnouncementDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          announcement={selectedAnnouncement}
        />
      </Box>
    </MainContent>
  );
};

export default Announcement;